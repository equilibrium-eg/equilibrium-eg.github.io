import pathlib
d=pathlib.Path(__file__).parent/'src'
h=(d/'index.template.html').read_text()
js='\n'.join((d/f).read_text() for f in ['art.js','content.js','hints.js','sims.js','app.js'])
h=h.replace('/*CSS*/',(d/'style.css').read_text()).replace('/*JS*/',js)
(pathlib.Path(__file__).parent/'index.html').write_text(h)
print(len(h))
