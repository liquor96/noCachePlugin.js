const fs = require("fs");
const path = require("path");

class NoCachePlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync("NoCachePlugin", (compilation, callback) => {
      try {
        let originalContent = compilation.assets["index.html"].source();

        let match;

        // match script
        const scriptLines = [];
        const scriptSrcRegex = /<script[^>]*src\s*=\s*['"]([^'"]+)['"][^>]*><\/script>/g;
        let scriptIndex = 0;
        while ((match = scriptSrcRegex.exec(originalContent)) !== null) {
          const scriptSrc = match[1];
          scriptLines.push(
            `const script${scriptIndex} = document.createElement('script'); script${scriptIndex}.defer = true; script${scriptIndex}.src = '${scriptSrc}'; document.head.appendChild(script${scriptIndex});`
          );
          scriptIndex += 1;
        }

        // match link
        const linkLines = [];
        const linkHrefRegex = /<link[^>]*href\s*=\s*['"]([^'"]+)['"][^>]*>/g;
        let linkIndex = 0;
        while ((match = linkHrefRegex.exec(originalContent)) !== null) {
          const linkHref = match[1];
          linkLines.push(
            `const link${linkIndex} = document.createElement('link'); link${linkIndex}.href = '${linkHref}'; link${linkIndex}.rel = 'stylesheet'; document.head.appendChild(link${linkIndex});`
          );
          linkIndex += 1;
        }

        const resources = [...scriptLines, ...linkLines].join("\n");
        fs.writeFileSync(path.join(compilation.outputOptions.path, "resource-paths.js"), resources);
        console.log("complete index.html resource to resource-paths.js");

        // delete link script
        originalContent = originalContent.replace(scriptSrcRegex, "");
        originalContent = originalContent.replace(linkHrefRegex, "");

        // insert script . add resource-paths.js
        const scriptContent = `
          <script>
            const _insertScript_ = document.createElement('script');
            _insertScript_.src = 'resource-paths.js' + '?t=' + new Date().getTime();
            document.head.appendChild(_insertScript_);
          </script>
        `;
        originalContent = originalContent.replace("</head>", `${scriptContent}</head>`);

        // update index.html
        compilation.assets["index.html"] = {
          source: () => originalContent,
          size: () => originalContent.length,
        };
      } catch (error) {
        console.error("NoCachePlugin Error: " + error);
      }

      callback();
    });
  }
}

module.exports = NoCachePlugin;
