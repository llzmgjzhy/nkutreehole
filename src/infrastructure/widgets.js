import React, { Component, PureComponent } from 'react';
import ReactDOM from 'react-dom';

import TimeAgo from 'react-timeago';
import chineseStrings from 'react-timeago/lib/language-strings/zh-CN';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

import './global.css';
import './widgets.css';

import appicon_hole from './appicon/coverchange.png';
// import appicon_imasugu from './appicon/imasugu.png';
// import appicon_imasugu_rev from './appicon/imasugu_rev.png';
// import appicon_syllabus from './appicon/syllabus.png';
// import appicon_score from './appicon/score.png';
// import appicon_course_survey from './appicon/course_survey.png';
// import appicon_dropdown from './appicon/dropdown.png';
// import appicon_dropdown_rev from './appicon/dropdown_rev.png';
// import appicon_homepage from './appicon/homepage.png';
import { NKUHELPER_ROOT } from './const';
import { get_json, API_VERSION_PARAM } from './functions';

const LOGIN_POPUP_ANCHOR_ID = 'pkuhelper_login_popup_anchor';

function pad2(x) {
  return x < 10 ? '0' + x : '' + x;
}
export function format_time(time) {
  return `${time.getMonth() + 1}-${pad2(
    time.getDate(),
  )} ${time.getHours()}:${pad2(time.getMinutes())}:${pad2(time.getSeconds())}`;
}
const chinese_format = buildFormatter(chineseStrings);
export function Time(props) {
  const time = new Date(props.stamp * 1000);
  return (
    <span>
      <TimeAgo
        date={time}
        formatter={chinese_format}
        title={time.toLocaleString('zh-CN', {
          timeZone: 'Asia/Shanghai',
          hour12: false,
        })}
      />
      &nbsp;
      {format_time(time)}
    </span>
  );
}

export function TitleLine(props) {
  return (
    <p className="centered-line title-line aux-margin">
      <span className="black-outline">{props.text}</span>
    </p>
  );
}

export function GlobalTitle(props) {
  return (
    <div className="aux-margin">
      <div className="title">
        <p className="centered-line">{props.text}</p>
      </div>
    </div>
  );
}

const FALLBACK_APPS = {
  // id, text, url, icon_normal, icon_hover, new_tab
  bar: [
    ['hole', '??????', '/hole', appicon_hole, null, false],
    // ['course_survey', '????????????', 'https://courses.pinzhixiaoyuan.com/', appicon_course_survey, null, true],
    // ['imasugu', '??????', '/spare_classroom', appicon_imasugu, appicon_imasugu_rev, false],
    // ['syllabus', '??????', '/syllabus', appicon_syllabus, null, false],
    // ['score', '??????', '/my_score', appicon_score, null, false],
  ],
  dropdown: [
    // ['course_survey', '????????????', 'https://courses.pinzhixiaoyuan.com/', appicon_course_survey, null, true],
    // ['homepage', '?????????', '/', appicon_homepage, null, true],
  ],
  fix: {},
};
const SWITCHER_DATA_VER = 'switcher_2';
const SWITCHER_DATA_URL = NKUHELPER_ROOT + 'web_static/appswitcher_items.json';

export class AppSwitcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apps: this.get_apps_from_localstorage(),
    };
  }

  get_apps_from_localstorage() {
    let ret = FALLBACK_APPS;
    // if (localStorage['APPSWITCHER_ITEMS'])
    //   try {
    //     let content = JSON.parse(localStorage['APPSWITCHER_ITEMS'])[
    //       SWITCHER_DATA_VER
    //     ];
    //     if (!content || !content.bar) throw new Error('content is empty');

    //     ret = content;
    //   } catch (e) {
    //     console.error('load appswitcher items from localstorage failed');
    //     console.trace(e);
    //   }

    return ret;
  }

  check_fix() {
    if (
      this.state.apps &&
      this.state.apps.fix &&
      this.state.apps.fix[this.props.appid]
    )
      setTimeout(() => {
        window.HOTFIX_CONTEXT = {
          build_info: process.env.REACT_APP_BUILD_INFO || '---',
          build_env: process.env.NODE_ENV,
        };
        eval(this.state.apps.fix[this.props.appid]);
      }, 1); // make it async so failures won't be critical
  }

  componentDidMount() {
    this.check_fix();
    // setTimeout(() => {
    //   fetch(SWITCHER_DATA_URL)
    //     .then((res) => {
    //       // if(!res.ok) throw Error(`???????????? ${res.status} ${res.statusText}`);
    //       return res.text();
    //     })
    //     .then((txt) => {
    //       if (txt !== localStorage['APPSWITCHER_ITEMS']) {
    //         console.log('loaded new appswitcher items', txt);
    //         localStorage['APPSWITCHER_ITEMS'] = txt;

    //         this.setState({
    //           apps: this.get_apps_from_localstorage(),
    //         });
    //       } else {
    //         console.log('appswitcher items unchanged');
    //       }
    //     })
    //     .catch((e) => {
    //       console.error('loading appswitcher items failed');
    //       console.trace(e);
    //     });
    // }, 500);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.apps !== prevState.apps) this.check_fix();
  }

  render() {
    let cur_id = this.props.appid;

    function app_elem(
      [id, title, url, icon_normal, icon_hover, new_tab],
      no_class = false,
      ref = null,
    ) {
      return (
        <a
          ref={ref}
          key={id}
          className={
            no_class
              ? null
              : 'app-switcher-item' +
                (id === cur_id ? ' app-switcher-item-current' : '')
          }
          href={url}
          target={new_tab ? '_blank' : '_self'}
        >
          {!!icon_normal && [
            <img
              key="normal"
              src={icon_normal}
              className="app-switcher-logo-normal"
            />,
            <img
              key="hover"
              src={icon_hover || icon_normal}
              className="app-switcher-logo-hover"
            />,
          ]}
          <span>{title}</span>
        </a>
      );
    }

    // let dropdown_cur_app=null;
    // this.state.apps.dropdown.forEach((app)=>{
    //     if(app[0]===cur_id)
    //         dropdown_cur_app=app;
    // });

    //console.log(JSON.stringify(this.state.apps));

    return (
      <div className="app-switcher">
        <span className="app-switcher-desc app-switcher-left">NKU</span>
        {this.state.apps.bar.map((app) => app_elem(app))}
        {/* {!!this.state.apps.dropdown.length &&
                    <div className={
                        'app-switcher-item app-switcher-dropdown '
                        +(dropdown_cur_app ? ' app-switcher-item-current' : '')
                    }>
                        <p className="app-switcher-dropdown-title">
                            {!!dropdown_cur_app ?
                                app_elem((()=>{
                                    let [id,title,_url,icon_normal,icon_hover,_new_tab]=dropdown_cur_app;
                                    return [id,title+'???',null,icon_normal,icon_hover,false];
                                })(),true) :
                                app_elem(['-placeholder-elem','?????????',null,appicon_dropdown,appicon_dropdown_rev,false],true)
                            }
                        </p>
                        {this.state.apps.dropdown.map((app)=>{
                            let ref=React.createRef();
                            return (
                                <p key={app[0]} className="app-switcher-dropdown-item" onClick={(e)=>{
                                    if(!e.target.closest('a') && ref.current)
                                        ref.current.click();
                                }}>
                                    {app_elem(app,true,ref)}
                                </p>
                            );
                        })}
                    </div>
                } */}
        <span className="app-switcher-desc app-switcher-right"></span>
      </div>
    );
  }
}

class LoginPopupSelf extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading_status: 'idle',
      excluded_scopes: [],
    };
    this.username_ref = React.createRef();
    this.password_ref = React.createRef();
    this.input_token_ref = React.createRef();

    this.popup_anchor = document.getElementById(LOGIN_POPUP_ANCHOR_ID);
    if (!this.popup_anchor) {
      this.popup_anchor = document.createElement('div');
      this.popup_anchor.id = LOGIN_POPUP_ANCHOR_ID;
      document.body.appendChild(this.popup_anchor);
    }
  }

  do_sendcode(type) {
    if (this.state.loading_status === 'loading') return;

    this.setState(
      {
        loading_status: 'loading',
      },
      () => {
        fetch(
          NKUHELPER_ROOT +
            'api_xmcp/login/send_code' +
            '?user=' +
            encodeURIComponent(this.username_ref.current.value) +
            '&code_type=' +
            encodeURIComponent(type) +
            API_VERSION_PARAM(),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              excluded_scopes: this.state.excluded_scopes || [],
            }),
          },
        )
          .then(get_json)
          .then((json) => {
            console.log(json);
            if (!json.success) throw new Error(JSON.stringify(json));

            alert(json.msg);
            this.setState({
              loading_status: 'done',
            });
          })
          .catch((e) => {
            console.error(e);
            alert('????????????\n' + e);
            this.setState({
              loading_status: 'done',
            });
          });
      },
    );
  }

  do_login(set_token) {
    if (this.state.loading_status === 'loading') return;
    let token = this.input_token_ref.current.value;
    this.setState(
      {
        loading_status: 'loading',
      },
      () => {
        fetch(
          // NKUHELPER_ROOT +
          //   'api_xmcp/login/login' +
          //   '?user=' +
          //   encodeURIComponent(this.username_ref.current.value) +
          //   '&password=' +
          //   encodeURIComponent(this.password_ref.current.value) +
          //   API_VERSION_PARAM(),
          // NKUHELPER_ROOT +
          //   'do_login.php' +
          //   '?user=' +
          //   encodeURIComponent(this.username_ref.current.value) +
          //   '&password=' +
          //   encodeURIComponent(this.password_ref.current.value) +
          //   API_VERSION_PARAM(),
          NKUHELPER_ROOT +
            'do_login.php' +
            '?user_token=' +
            encodeURIComponent(token) +
            API_VERSION_PARAM(),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              excluded_scopes: this.state.excluded_scopes || [],
            }),
          },
        )
          .then(get_json)
          .then((json) => {
            if (json.code !== 0) {
              if (json.msg) throw new Error(json.msg);
              throw new Error(JSON.stringify(json));
            }

            set_token(json.user_token);
            alert(`????????????`);
            this.setState({
              loading_status: 'done',
            });
            this.props.set_mode('list', null);
            this.props.on_close();
          })
          .catch((e) => {
            console.log(e);
            alert('???????????????????????????User Token');
            this.setState({
              loading_status: 'done',
            });
          });
      },
    );
  }

  do_input_token(set_token) {
    if (this.state.loading_status === 'loading') return;

    let token = this.input_token_ref.current.value;
    this.setState(
      {
        loading_status: 'loading',
      },
      () => {
        fetch(
          NKUHELPER_ROOT +
            'api_xmcp/hole/system_msg?user_token=' +
            encodeURIComponent(token) +
            API_VERSION_PARAM(),
        )
          .then((res) => res.json())
          .then((json) => {
            if (json.error) throw new Error(json.error);
            if (json.result.length === 0)
              throw new Error('result check failed');
            this.setState({
              loading_status: 'done',
            });
            set_token(token);
            this.props.on_close();
          })
          .catch((e) => {
            alert('Token????????????\n' + e);
            this.setState({
              loading_status: 'done',
            });
            console.error(e);
          });
      },
    );
  }

  perm_alert() {
    // alert('?????????????????? PKU Helper ?????????????????????????????????????????????\n??????????????????????????????????????????????????????????????????\n?????????????????????????????????????????????????????????????????????????????????????????????????????????');
  }

  render() {
    // let PERM_SCOPES=[
    //     ['score','????????????'],
    //     ['syllabus','????????????'],
    //     ['my_info','????????????'],
    // ];

    return ReactDOM.createPortal(
      <div>
        <div className="pkuhelper-login-popup-shadow" />
        <div className="pkuhelper-login-popup">
          {/* <p>
                        <b>???????????????????????? PKU Helper</b>
                    </p> */}
          {/* <p>
                        ????????????<a onClick={this.perm_alert.bind(this)}>(?)</a>
                        {PERM_SCOPES.map(([scope,title])=>(
                            <label key={scope} className="perm-item">
                                <input type="checkbox" checked={this.state.excluded_scopes.indexOf(scope)===-1} onChange={(e)=>{
                                    let chk=e.target.checked;
                                    this.setState((prevState)=>{
                                        let exc=prevState.excluded_scopes.slice();
                                        if(chk) { // remove from exc
                                            let pos=exc.indexOf(scope);
                                            if(pos!==-1)
                                                exc.splice(pos,1);
                                        } else { // add to exc
                                            exc.push(scope);
                                        }
                                        return {
                                            excluded_scopes: exc,
                                        };
                                    });
                                }} />
                                {title}
                            </label>
                        ))}
                    </p> */}
          {/* <p>
            <label>
              ?????????&nbsp;
              <input ref={this.username_ref} type="tel" autoFocus={true} />
            </label> */}
          {/* <span className="pkuhelper-login-type">
                                <a onClick={(e)=>this.do_sendcode('sms')}>
                                    &nbsp;??????&nbsp;
                                </a>
                                /
                                <a onClick={(e)=>this.do_sendcode('mail')}>
                                    &nbsp;??????&nbsp;
                                </a>
                            </span> */}
          {/* </p> */}
          {/* <p>
            <label>
              &nbsp;&nbsp;&nbsp;&nbsp;??????&nbsp;
              <input ref={this.password_ref} type="password" />
            </label>
          </p>
          <hr />
          <p>
            <button
              type="button"
              disabled={this.state.loading_status === 'loading'}
              onClick={(e) => this.do_login(this.props.token_callback)}
            >
              ??????
            </button>
          </p> */}
          {/* <hr /> */}
          <p>
            {/* <b>?????????????????????????????????</b> */}
            <b>??????Token??????</b>
          </p>
          <hr />
          <p>
            <input ref={this.input_token_ref} placeholder="User Token" />
            <br />
            <br />
            {/* <button type="button" disabled={this.state.loading_status==='loading'}
                                onClick={(e)=>this.do_input_token(this.props.token_callback)}>
                            ??????
                        </button> */}
            <button
              type="button"
              disabled={this.state.loading_status === 'loading'}
              onClick={(e) => this.do_login(this.props.token_callback)}
            >
              ??????
            </button>
          </p>
          {/* <hr /> */}
          <p>
            <button onClick={this.props.on_close}>??????</button>
          </p>
        </div>
      </div>,
      this.popup_anchor,
    );
  }
}

export class LoginPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popup_show: false,
    };
    this.on_popup_bound = this.on_popup.bind(this);
    this.on_close_bound = this.on_close.bind(this);
  }

  on_popup() {
    this.setState({
      popup_show: true,
    });
  }
  on_close() {
    this.setState({
      popup_show: false,
    });
  }

  render() {
    return (
      <>
        {this.props.children(this.on_popup_bound)}
        {this.state.popup_show && (
          <LoginPopupSelf
            token_callback={this.props.token_callback}
            on_close={this.on_close_bound}
            set_mode={this.props.set_mode}
          />
        )}
      </>
    );
  }
}
