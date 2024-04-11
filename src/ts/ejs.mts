// Modules
import fs from 'fs';
import chokidar from 'chokidar';
import ejs from 'ejs';
import jsBeutify from 'js-beautify';
const { html: beautify } = jsBeutify;
import { glob } from 'glob';

type Settings = {
  input: string;
  output: string;
};

function build() {
  // Input/Output settings
  const IO_SETTINGS: Settings = {
    input: 'src\\ejs\\',
    output: 'public\\',
  };

  // Generate data object

  // JSON file
  const jsonFile = 'src\\ejs\\data.json';

  // Check existence of JSON file
  if (fs.existsSync(jsonFile) === true) {
    // Loading JSON file
    fs.readFile(jsonFile, 'utf8', (err, json) => {
      if (err) throw err;
      // Convert to data object
      const data = JSON.parse(json);
      console.log('[\u001b[31mFile system\u001b[0m] Loaded ' + jsonFile + ' as data object');

      run(IO_SETTINGS, data);
    });
  } else {
    const data = new Object();
    run(IO_SETTINGS, data);
  }

  function run(dir: Settings, data: ejs.Data) {
    // Check existence of target directory
    if (fs.existsSync(dir.input) === true) {
      // Start watching (Specify target)
      const watcher = chokidar.watch([dir.input + '**\\*.ejs']);
      console.log('[\u001b[34mChokidar\u001b[0m] Watching: ' + dir.input + '**\\*' + '.ejs');
      // Watcher events
      watcher.on('change', (path) => {
        console.log('[\u001b[34mChokidar\u001b[0m] Modified: ' + path);
        // Get file name
        const fileName = path.split('\\').slice(-1)[0];
        // Determine part file
        if (fileName.match(/^_/g) === null) {
          // Render EJS file
          renderEJS(path);
        } else {
          // Asynchronous processing for using glob
          (async () => {
            // Prepare all EJS files except part files with glob
            const files = await glob(dir.input.replace(/\\/g, '/') + '**/*.ejs', { ignore: dir.input.replace(/\\/g, '/') + '**/_*.ejs' });
            // Loop for the number of elements in the files array
            files.forEach((file) => {
              file = file.replace('/', '\\');
              // Render EJS file
              renderEJS(file);
            });
          })();
        }

        function renderEJS(srcFile: string) {
          // Render EJS file
          ejs.renderFile(srcFile, data, (err, html) => {
            if (err) throw err;
            // Format HTML with Beautify
            const formattedHTML = beautify(html, {
              // Beautify options
              indent_size: 2,
              end_with_newline: true,
              max_preserve_newlines: 0,
            });
            // Generate output file path from input file path
            srcFile = srcFile.replace(dir.input, dir.output).replace(/\.ejs$/, '.html');
            const outputDir = srcFile.split('\\');
            outputDir.pop();
            const outputDirStr = outputDir.join('\\') + '\\';
            // Check existence of output directory
            if (fs.existsSync(outputDirStr) === false) {
              // Create the output directory if it does not exist
              fs.mkdirSync(outputDirStr, { recursive: true });
              console.log('[\u001b[31mFile system\u001b[0m] Create the output directory: ' + outputDirStr);
            }
            // Output HTML file
            fs.writeFile(srcFile, formattedHTML, 'utf8', (err) => {
              if (err) throw err;
            });
            console.log('[\u001b[35mEJS\u001b[0m] Rendered: ' + srcFile);
          });
        }
      });
    } else {
      console.log('[\u001b[31mFile system\u001b[0m] Input directory is not found.');
    }
  }
}

export const watchEjs = build();
