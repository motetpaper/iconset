//
// app.js
// job    : makes an iconset
// git    : https://github.com/motetpaper/iconset
// lic    : MIT
//
//
//

if ("serviceWorker" in navigator) {
  // declaring scope manually
  navigator.serviceWorker.register("sw.js").then(
    (registration) => {
      console.log("Service worker registration succeeded:", registration);
    },
    (error) => {
      console.error(`Service worker registration failed: ${error}`);
    },
  );
} else {
  console.error("Service workers are not supported.");
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
  const tag = hex.replace(/[^A-Fa-f]/,'');
  const outfile = `motetpaper-iconset-${tag}.zip`;

  const dims = [
    3000, 2048, 1400, 1024,
    512, 256, 216, 180, 167,
    152, 128, 120, 114, 96,
    88, 80, 76, 64,
    58, 48, 32, 16,
  ];

  await favicon({ color: hex });

  for(let i in dims) {
    await icon({ size: dims[i],
      color: hex,});
  }


  btn_txt('exporting...');
  zip.generateAsync({type:"blob"}).then((b) => {
    save(b);
  });

  async function save(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outfile;
      a.click();
      btn_reset();
  }

  async function icon(opts) {

    const url = await iconurl(opts);

    await fetch(url)
    .then((r)=>r.blob())
    .then((b)=>{
      const img = zip.folder("icons");
      img.file(`icon${opts.size}.png`, b, {base64: true});
    });
  }

  async function favicon(opts) {

    const url = await faviconurl(opts);

    await fetch(url)
    .then((r)=>r.blob())
    .then((b)=>{
      const img = zip.folder("icons");
      img.file(`favicon.ico`, b, {base64: true});
    });
  }
}

async function preview() {
  seebox.src = await iconurl({
    size: 300,
    color: colorbox.value,
  });
}

async function iconurl(opts) {

  const s = opts.size;
  const c = opts.color;

  const [ w, h ] = [ s, s ];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = w;
  canvas.height = h;

  ctx.beginPath();

  switch(shapebox.value) {
    case 'square':
      ctx.fillStyle = c;
      ctx.fillRect(0, 0, w, h);
      break;
    case 'round':
      ctx.fillStyle = c;
      ctx.arc(w/2, h/2, w/2, 0, 2 * Math.PI);
      ctx.fill();
      break;
    default:
      // nothing
      break;
  }

  return canvas.toDataURL();
}

async function faviconurl(opts) {

  const c = opts.color;

  const [ w, h ] = [ 16, 16 ];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = w;
  canvas.height = h;

  ctx.beginPath();

  ctx.fillStyle = c;
  ctx.fillRect(0, 0, w, h);

  return canvas.toDataURL('image/x-icon');
}
