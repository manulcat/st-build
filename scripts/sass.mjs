// Modules
import fs from 'fs';
import chokidar from 'chokidar';
import * as sass from 'sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
const IO_SETTINGS = [
    {
        fileName: 'style',
        inputDir: 'src\\scss\\',
        outputDir: 'public\\assets\\css\\',
    },
];
function build(ioSettings) {
    // Loop for the number of elements in the input/Output settings array
    ioSettings.forEach((element, index) => {
        // Check existence of target directory
        if (fs.existsSync(element.inputDir) === true) {
            // Start watching (Specify target)
            const watcher = chokidar.watch([element.inputDir + '**\\*' + '.scss']);
            console.log('[\u001b[34mChokidar\u001b[0m] Watching [' + index + ']: ' + element.inputDir + '**\\*' + '.scss');
            // Watcher events
            watcher.on('change', (path) => {
                console.log('[\u001b[34mChokidar\u001b[0m] Modified [' + index + ']: ' + path);
                const sassOptions = [
                    {
                        style: 'expanded',
                    },
                    {
                        style: 'compressed',
                    },
                ];
                // Loop for the number of elements in the Sass options array
                sassOptions.forEach((opt) => {
                    // Compile modified files
                    const compiler = sass.compile(element.inputDir + element.fileName + '.scss', opt);
                    // PostCSS plugin
                    const postcssPlugin = [autoprefixer];
                    // PostCSS options
                    const postcssOptions = {
                        // PostCSS Options
                        from: element.inputDir + element.fileName + '.scss',
                        to: element.outputDir + element.fileName + '.css',
                        map: false,
                    };
                    // Load PostCSS
                    postcss(postcssPlugin)
                        // Load CSS compiled by Sass
                        .process(compiler.css, postcssOptions)
                        // Run PostCSS
                        .then((result) => {
                        // File extension
                        const ext = opt.style === 'compressed' ? '.min.css' : '.css';
                        // Check existence of output directory
                        if (fs.existsSync(element.outputDir) === false) {
                            // Create the output directory if it does not exist
                            fs.mkdirSync(element.outputDir, { recursive: true });
                            console.log('[\u001b[31mFile system\u001b[0m] Create the output directory [' + index + ']: ' + element.outputDir);
                        }
                        // Output CSS file
                        fs.writeFile(element.outputDir + element.fileName + ext, result.css, (err) => {
                            if (err)
                                throw err;
                        });
                        console.log('[\u001b[35mSass\u001b[0m] Compiled [' + index + ']: ' + element.outputDir + element.fileName + ext);
                        // Check if source map is defined
                        if (result.map !== undefined) {
                            // Output source map if it does not undefined
                            fs.writeFile(element.outputDir + element.fileName + ext + '.map', result.map.toString(), (err) => {
                                if (err)
                                    throw err;
                            });
                        }
                    });
                });
            });
        }
        else {
            console.log('[\u001b[31mFile system\u001b[0m] Input directory [' + index + '] is not found.');
        }
    });
}
export const watchSass = build(IO_SETTINGS);
