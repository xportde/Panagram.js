import controlsPremade from './config';

const execute = (el, command, val) => {
  if (el && !command.includes('List')) {
    el.classList.toggle('active');
  }
  document.execCommand(command, false, val ? val: null);
}

export const init = (settings) => {
  const controls = typeof settings.controls === 'string'
    ? controlsPremade[settings.controls]
    : settings.controls;
  const ctrElement = settings.ctrElement;
  const outElement = settings.outElement;

  outElement.contentEditable = true;
  outElement.classList.add('output-el');

  ['click', 'touch'].forEach((evn) => {
    ctrElement.addEventListener(evn, outElement.focus.bind(outElement));
  });

  outElement.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      event.preventDefault();
    } else if ((event.key === 'Enter' && document.queryCommandValue('formatBlock') === 'blockquote') || outElement.innerHTML === "" || outElement.innerHTML === "<br>") {
      setTimeout(execute.bind(null, null, 'formatBlock', '<div>'), 0);
    }
  });

  controls.forEach(control => {
    const button = document.createElement('button');
    button.innerHTML = control.icon;
    button.title = control.title;
    button.setAttribute('type', 'button');
    button.classList.add('ctrl-btn');

    if (control.short) {
      document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key.toLowerCase() === control.short) {
            button.classList.toggle('active');
        }
      })
    }

    ['click', 'touch'].forEach((evn) => {
      if (control.state) {
        button.addEventListener(evn, execute.bind(null, button, control.comName));
        ['keyup', 'mouseup'].forEach(cnt => {
          outElement.addEventListener(cnt, (e) => {
            if (document.queryCommandState(control.comName) && !control.comName.includes('List')) {
              button.classList.add('active');
            } else if (button.classList.contains('active')) {
              button.classList.remove('active');
            }
        });
      });
      } else if (control.formatBlock) {
        button.addEventListener(evn, execute.bind(null, null, control.formatBlock, control.comName));
      } else {
        button.addEventListener(evn, () => {
          const val = (control.extra)();
          if (val) {
            execute(null, control.comName, val);
          }
        });
      }
    });

    ctrElement.append(button);
  });
}
