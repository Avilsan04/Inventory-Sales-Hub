function collectStyles(): string {
  return Array.from(document.styleSheets)
    .flatMap((sheet): string[] => {
      try {
        return Array.from(sheet.cssRules).map((r) => r.cssText);
      } catch {
        return [];
      }
    })
    .join('\n');
}

export function printElement(elementId: string, title = 'Justificante'): void {
  const el = document.getElementById(elementId);
  if (!el) return;

  const win = window.open('', '_blank', 'width=900,height=590');
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
${collectStyles()}
@page { size: A5 portrait; margin: 0; }
html { font-size: 16px; }
body { margin: 0; padding: 15mm; background: #fff; box-sizing: border-box; }
#${elementId} { width: 100%; max-width: none; }
@media screen { body { opacity: 0; } }
</style>
</head>
<body>${el.outerHTML}</body>
</html>`);
  win.document.close();
  try {
    win.history.replaceState({}, title, window.location.href);
  } catch {
    /* cross-origin guard */
  }

  const doPrint = (): void => {
    win.focus();
    win.print();
    win.close();
  };

  if (win.document.readyState === 'complete') {
    doPrint();
  } else {
    win.addEventListener('load', doPrint);
  }
}
