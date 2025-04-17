//
// app.js
// job    : makes an iconset
// git    : https://github.com/motetpaper/iconset
// lic    : MIT
//
//
//

if ('serviceWorker' in navigator) {

  navigator.serviceWorker.register('sw.js').then(
    (registration) => {
      console.log('[app.js] service worker reg OK.', registration);
    },
    (error) => {
      console.error(`[app.js] service worker reg failed: ${error}`);
    },
  );
} else {
  console.error('[app.js] service worker unsupported.');
}

const shapebox = document.querySelector('#icontype');
const colorbox = document.querySelector('#iconcolor');
const seebox = document.querySelector('#preview')
const btn = document.querySelector('#savebtn');

document.addEventListener('DOMContentLoaded', function(){
  restore();
  preview();
})

shapebox.addEventListener('change', function(e){
  upd();
});

colorbox.addEventListener('input', function(e){
  upd();
});

async function restore() {
  let num = localStorage.getItem('shape') ?? '0';
  let hex = localStorage.getItem('color') ?? '#0066ff';
  shapebox.options.selectedIndex = +num;
  colorbox.value = '' + hex;
  console.log(+num, hex)
}

async function upd() {
  localStorage.setItem('shape', ''+shapebox.options.selectedIndex);
  localStorage.setItem('color', colorbox.value);
  console.log(localStorage.getItem('shape'));
  console.log(localStorage.getItem('color'));
  preview();
}

btn.addEventListener('click', function(e){
  btn_off();
  btn_txt('making...');
  iconset();
})

async function btn_on(){
  btn.disabled = false;
}

async function btn_off(){
  btn.disabled = true;
}

async function btn_reset()   {
  btn_txt('Make ICONSET');
  btn_on();
}

async function btn_txt(str) {
  btn.innerText = str;
}

async function iconset() {

  let zip = new JSZip();

  const hex = colorbox.value;
  const shape = shapebox.value;

  const tag = hex.replace(/[^A-Fa-f]/,'');
  const outfile = `motetpaper-iconset-${tag}.zip`;

  const dims = [
    3000, 2048, 1400, 1024,
    512, 256, 216, 180, 167,
    152, 128, 120, 114, 96,
    88, 80, 76, 64,
    58, 48, 32, 16,
  ];

  // adds favicon
  await icon({
    color: hex,
    shape: shape,
    isFavicon: true,
  });

  // adds other icons
  for(let i in dims) {
    await icon({
      color: hex,
      shape: shape,
      size: dims[i],
      filename: `icon${dims[i]}.png`,
    });
  }

  btn_txt('exporting...');
  zip.generateAsync({type:"blob"}).then((b) => {
    save(b);
  });

  // exports the zip archive to the desktop/mobile env
  async function save(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outfile;
      a.click();
      btn_reset();
  }

  // adds an icon to the zip archive
  async function icon(opts) {

    const fn = !!opts.isFavicon ? 'favicon.ico' : opts.filename;
    const url = await iconurl(opts);

    await fetch(url)
    .then((r)=>r.blob())
    .then((b)=>{
      const img = zip.folder("icons");
      img.file(fn, b, {base64: true});
    });
  }
}


// returns data URL with base64 representation of icon
async function iconurl(opts) {

  const mimeType = !!opts.isFavicon ? 'image/x-icon' : 'image/png';

  // using the + operator cast value as type Number
  const size = !!opts.isFavicon ? 16 : +opts.size;

  // expecting #hashed hex triplets
  const hexcolor = opts.color;

  // expecting 'round' or 'square, for now'
  const shape = opts.shape;

  // canvas details
  const [ w, h ] = [ size, size ];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = w;
  canvas.height = h;

  // draw the icon
  ctx.beginPath();

  switch(shape) {
    case 'square':
      ctx.fillStyle = hexcolor;
      ctx.fillRect(0, 0, w, h);
      break;
    case 'round':
      ctx.fillStyle = hexcolor;
      ctx.arc(w/2, h/2, w/2, 0, 2 * Math.PI);
      ctx.fill();
      break;
    default:
      // nothing here
      break;
  }

  return canvas.toDataURL(mimeType);
}

async function preview() {
  seebox.src = await iconurl({
    size: 300,
    color: colorbox.value,
    shape: shapebox.value,
  });
}
