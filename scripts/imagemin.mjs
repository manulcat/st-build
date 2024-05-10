import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
const files = await imagemin(['src\\img\\**\\*.{jpg,png}'], {
    destination: 'public\\assets\\img\\',
    plugins: [
        imageminMozjpeg({
            quality: 85,
        }),
        imageminPngquant({
            quality: [0.65, 0.8],
        }),
    ],
});
console.log(files);
