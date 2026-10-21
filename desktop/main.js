// LifeIG for Windows: the same app as the website, in its own window.
const { app, BrowserWindow, shell, nativeTheme } = require('electron');
const fs = require('fs'), path = require('path');

// Windows shows reminder notifications under this app's name and icon
app.setAppUserModelId('io.github.volodyarua.lifeig');

// One window only, so two copies never overwrite each other's saved data.
if (!app.requestSingleInstanceLock()) app.quit();
else {
  let win;
  const boundsFile = path.join(app.getPath('userData'), 'window.json');
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

  app.whenReady().then(() => {
    let bounds = { width: 1200, height: 860 };
    try { bounds = JSON.parse(fs.readFileSync(boundsFile, 'utf8')); } catch {}
    win = new BrowserWindow({
      ...bounds, minWidth: 380, minHeight: 520, title: 'LifeIG', show: false,
      backgroundColor: nativeTheme.shouldUseDarkColors ? '#0F1211' : '#E3E5DC',
    });
    win.removeMenu();
    win.once('ready-to-show', () => win.show());
    win.on('close', () => { try { fs.writeFileSync(boundsFile, JSON.stringify(win.getNormalBounds())); } catch {} });

    // Websites, phone numbers and email addresses open in their usual apps, never inside LifeIG.
    const openOutside = url => { if (/^(https?|mailto|tel):/i.test(url)) shell.openExternal(url); };
    win.webContents.setWindowOpenHandler(({ url }) => { openOutside(url); return { action: 'deny' }; });
    win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); openOutside(url); } });

    win.loadFile(path.join(__dirname, 'web', 'index.html'));
  });
  app.on('window-all-closed', () => app.quit());
}
