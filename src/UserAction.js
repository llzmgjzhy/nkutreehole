import React, { Component } from 'react';
import {
  API_BASE,
  SafeTextarea,
  SafeTextareaPost,
  PromotionBar,
} from './Common';
import { MessageViewer } from './Message';
import { LoginPopup } from './infrastructure/widgets';
import { ConfigUI } from './Config';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import SendIcon from '@mui/icons-material/Send';
import CachedIcon from '@mui/icons-material/Cached';
import LoopIcon from '@mui/icons-material/Loop';
import IconButton from '@mui/material/IconButton';
import fixOrientation from 'fix-orientation';
import copy from 'copy-to-clipboard';
import { cache } from './cache';
import {
  API_VERSION_PARAM,
  NKUHELPER_ROOT,
  get_json,
  token_param,
} from './flows_api';

import './UserAction.css';

const BASE64_RATE = 4 / 3;
const MAX_IMG_DIAM = 8000;
const MAX_IMG_PX = 5000000;
const MAX_IMG_FILESIZE = 450000 * BASE64_RATE;

export const TokenCtx = React.createContext({
  value: null,
  set_value: () => {},
});

class LifeInfoBox extends Component {
  constructor(props) {
    super(props);
    if (!window._life_info_cache) window._life_info_cache = {};
    this.CACHE_TIMEOUT_S = 15;
    this.state = {
      today_info: this.cache_get('today_info'),
      card_balance: this.cache_get('card_balance'),
      net_balance: this.cache_get('net_balance'),
      mail_count: this.cache_get('mail_count'),
    };
    this.INTERNAL_NETWORK_FAILURE = '_network_failure';
    this.API_NAME = {
      today_info: 'hole/today_info',
      card_balance: 'isop/card_balance',
      net_balance: 'isop/net_balance',
      mail_count: 'isop/mail_count',
    };
  }

  cache_get(key) {
    const cache_item = window._life_info_cache[key];
    if (
      !cache_item ||
      +new Date() - cache_item[0] > 1000 * this.CACHE_TIMEOUT_S
    )
      return null;
    else return cache_item[1];
  }
  cache_set(key, value) {
    if (
      !window._life_info_cache[key] ||
      window._life_info_cache[key][1] !== value
    )
      window._life_info_cache[key] = [+new Date(), value];
  }

  load(state_key) {
    this.setState(
      {
        [state_key]: null,
      },
      () => {
        fetch(
          NKUHELPER_ROOT +
            'api_xmcp/' +
            this.API_NAME[state_key] +
            '?user_token=' +
            encodeURIComponent(this.props.token) +
            API_VERSION_PARAM(),
        )
          .then(get_json)
          .then((json) => {
            //console.log(json);
            this.setState({
              [state_key]: json,
            });
          })
          .catch((e) => {
            this.setState({
              [state_key]: {
                errMsg: '???????????? ' + e,
                errCode: this.INTERNAL_NETWORK_FAILURE,
                success: false,
              },
            });
          });
      },
    );
  }

  componentDidMount() {
    ['today_info', 'card_balance', 'net_balance', 'mail_count'].forEach((k) => {
      if (!this.state[k]) this.load(k);
    });
  }

  reload_all() {
    ['today_info', 'card_balance', 'net_balance', 'mail_count'].forEach((k) => {
      this.load(k);
    });
  }

  render_line(state_key, title, value_fn, action, url_fn, do_login) {
    const s = this.state[state_key];
    if (!s)
      return (
        <tr>
          <td>{title}</td>
          <td>???????????????</td>
          <td />
        </tr>
      );
    else if (!s.success) {
      let type = '????????????';
      if (s.errCode === this.INTERNAL_NETWORK_FAILURE) type = '????????????';
      else if (['E01', 'E02', 'E03'].indexOf(s.errCode) !== -1)
        type = '????????????';

      let details = JSON.stringify(s);
      if (s.errMsg) details = s.errMsg;
      else if (s.error) details = s.error;

      return (
        <tr>
          <td>{title}</td>
          <td className="life-info-error">
            <a onClick={() => alert(details)}>{type}</a>
          </td>
          <td>
            {type === '????????????' ? (
              <a onClick={do_login}>
                <span className="icon icon-forward" />
                &nbsp;????????????
              </a>
            ) : (
              <a onClick={() => this.load(state_key)}>
                <span className="icon icon-forward" />
                &nbsp;??????
              </a>
            )}
          </td>
        </tr>
      );
    } else {
      this.cache_set(state_key, s);

      return (
        <tr>
          <td>{title}</td>
          <td>{value_fn(s)}</td>
          <td>
            <a href={url_fn(s)} target="_blank">
              <span className="icon icon-forward" />
              &nbsp;{action}
            </a>
          </td>
        </tr>
      );
    }
  }

  render() {
    return (
      <LoginPopup
        token_callback={(t) => {
          this.props.set_token(t);
          this.reload_all();
        }}
      >
        {(do_login) => (
          <div className="box">
            <table className="life-info-table">
              <tbody>
                {this.render_line(
                  'today_info',
                  '??????',
                  (s) => s.info,
                  '??????',
                  (s) => s.schedule_url,
                  do_login,
                )}
                {this.render_line(
                  'card_balance',
                  '?????????',
                  (s) => `?????????${s.balance.toFixed(2)}`,
                  '??????',
                  () =>
                    'https://virtualprod.alipay.com/educate/educatePcRecharge.htm?schoolCode=PKU&schoolName=',
                  do_login,
                )}
                {this.render_line(
                  'net_balance',
                  '??????',
                  (s) => `?????????${s.balance.toFixed(2)}`,
                  '??????',
                  () => 'https://its.pku.edu.cn/epay.jsp',
                  do_login,
                )}
                {this.render_line(
                  'mail_count',
                  '??????',
                  (s) => `?????? ${s.count} ???`,
                  '??????',
                  () => 'https://mail.pku.edu.cn/',
                  do_login,
                )}
              </tbody>
            </table>
          </div>
        )}
      </LoginPopup>
    );
  }
}

export function InfoSidebar(props) {
  return (
    <div>
      {/* <PromotionBar /> */}
      <LoginForm show_sidebar={props.show_sidebar} set_mode={props.set_mode} />
      <div className="box list-menu">
        <a
          onClick={() => {
            props.show_sidebar('??????', <ConfigUI />);
          }}
        >
          <span className="icon icon-settings" />
          <label>????????????</label>
        </a>
        {/* &nbsp;&nbsp;
        <a
          href="http://pkuhelper.pku.edu.cn/treehole_rules.html"
          target="_blank"
        >
          <span className="icon icon-textfile" />
          <label>????????????</label>
        </a>
        &nbsp;&nbsp;
        <a
          href="https://github.com/AllanChain/PKUHoleCommunity/issues"
          target="_blank"
        >
          <span className="icon icon-github" />
          <label>????????????</label>
        </a> */}
      </div>
      {/* <div className="box help-desc-box">
        <p>
          PKUHelper ???????????????????????? by @xmcp, and awesome community. ??????&nbsp;
          <a
            href="https://www.gnu.org/licenses/gpl-3.0.zh-cn.html"
            target="_blank"
          >
            GPLv3
          </a>
          &nbsp;?????????{' '}
          <a
            href="https://github.com/AllanChain/PKUHoleCommunity"
            target="_blank"
          >
            GitHub
          </a>{' '}
          ??????
        </p>
        <p>
          PKUHelper ???????????????????????????&nbsp;
          <a href="https://reactjs.org/" target="_blank" rel="noopener">
            React
          </a>
          ???
          <a href="https://icomoon.io/#icons" target="_blank" rel="noopener">
            IcoMoon
          </a>
          &nbsp;???????????????
        </p>
        <p>PKU Helper ???????????????</p>
        <blockquote>
          <p>
            ?????? GPL???????????? fork???????????????????????????????????????????????????????????????
            ???????????????????????????????????????????????? GPL ????????????????????????????????????
          </p>
          <p>
            ?????????????????? 5.3 ?????????????????????????????? PKU Helper
            ?????????????????????????????????
            ?????????????????????????????????????????????????????????????????????????????????????????????
          </p>
        </blockquote>
        <p>
          ?????????????????????????????????????????????????????????????????? PKU Helper
          ???????????????????????????????????? ??????????????????????????????no
          warranty?????????????????????????????????????????????????????????????????????
        </p>
        <p>
          <a
            onClick={() => {
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker
                  .getRegistrations()
                  .then((registrations) => {
                    for (const registration of registrations) {
                      console.log('unregister', registration);
                      registration.unregister();
                    }
                  });
              }
              cache().clear();
              setTimeout(() => {
                window.location.reload(true);
              }, 200);
            }}
          >
            ??????????????????
          </a>
          ???Community v{process.env.REACT_APP_VERSION || '---'}{' '}
          {process.env.NODE_ENV} ????????????????????????????????????????????????????????????
        </p>
      </div> */}
    </div>
  );
}

class ResetUsertokenWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading_status: 'done',
    };
  }

  do_reset() {
    if (
      window.confirm(
        '??????????????? UserToken???\n?????????????????????????????????????????????????????????????????????????????????',
      )
    ) {
      const uid = window.prompt(
        '??????????????? UserToken???\n???????????????????????????????????????',
      );
      if (uid)
        this.setState(
          {
            loading_status: 'loading',
          },
          () => {
            fetch(NKUHELPER_ROOT + 'api_xmcp/hole/reset_usertoken', {
              method: 'post',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_token: this.props.token,
                uid: uid,
              }),
            })
              .then(get_json)
              .then((json) => {
                if (json.error) throw new Error(json.error);
                else alert('?????????????????????????????????????????????????????????');

                this.setState({
                  loading_status: 'done',
                });
              })
              .catch((e) => {
                alert('???????????????' + e);
                this.setState({
                  loading_status: 'done',
                });
              });
          },
        );
    }
  }

  render() {
    if (this.state.loading_status === 'done')
      return <a onClick={this.do_reset.bind(this)}>??????</a>;
    else if (this.state.loading_status === 'loading')
      return (
        <a>
          <span className="icon icon-loading" />
        </a>
      );
  }
}

export class LoginForm extends Component {
  constructor(props) {
    super(props);
  }
  copy_token(token) {
    if (copy(token)) alert('???????????????\n????????????????????????');
  }

  render() {
    return (
      <TokenCtx.Consumer>
        {(token) => (
          <div>
            {/* {!!token.value && (
              <LifeInfoBox token={token.value} set_token={token.set_value} />
            )} */}
            <div className="login-form box">
              {token.value ? (
                <div>
                  <p>
                    <b>???????????????</b>
                    <button
                      type="button"
                      onClick={() => {
                        token.set_value(null);
                        window.location.reload();
                      }}
                    >
                      <span className="icon icon-logout" /> ??????
                    </button>
                    <br />
                  </p>
                  <p>?????????????????????????????????????????????????????????</p>
                  {/* <p>
                    <a
                      onClick={() => {
                        this.props.show_sidebar(
                          '????????????',
                          <MessageViewer token={token.value} />,
                        );
                      }}
                    >
                      ??????????????????
                    </a>
                    <br />
                    ??????????????????????????????????????????????????????????????????
                  </p> */}
                  <p>
                    <a onClick={this.copy_token.bind(this, token.value)}>
                      ?????? User Token
                    </a>
                    <br />
                    {/* User Token
                    ???????????????????????????????????????????????????????????????????????????{' '}
                    <ResetUsertokenWidget token={token.value} /> */}
                    User Token ?????????????????????????????????????????????
                  </p>
                </div>
              ) : (
                <LoginPopup
                  token_callback={token.set_value}
                  set_mode={this.props.set_mode}
                >
                  {(do_popup) => (
                    <div>
                      <p>
                        <button type="button" onClick={do_popup}>
                          <span className="icon icon-login" />
                          &nbsp;??????
                        </button>
                      </p>
                      <p>
                        <small>?????????</small>
                      </p>
                    </div>
                  )}
                </LoginPopup>
              )}
            </div>
          </div>
        )}
      </TokenCtx.Consumer>
    );
  }
}

export class ReplyForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      loading_status: 'done',
      token: props.token,
    };
    this.on_change_bound = this.on_change.bind(this);
    this.area_ref = this.props.area_ref || React.createRef();
    this.global_keypress_handler_bound =
      this.global_keypress_handler.bind(this);
  }

  global_keypress_handler(e) {
    if (
      e.code === 'Enter' &&
      !e.ctrlKey &&
      !e.altKey &&
      ['input', 'textarea'].indexOf(e.target.tagName.toLowerCase()) === -1
    ) {
      if (this.area_ref.current) {
        e.preventDefault();
        this.area_ref.current.focus();
      }
    }
  }
  componentDidMount() {
    document.addEventListener('keypress', this.global_keypress_handler_bound);
  }
  componentWillUnmount() {
    document.removeEventListener(
      'keypress',
      this.global_keypress_handler_bound,
    );
  }

  on_change(value) {
    this.setState({
      text: value,
    });
  }

  on_submit(event) {
    if (event) event.preventDefault();
    if (this.state.loading_status === 'loading') return;
    this.setState({
      loading_status: 'loading',
    });

    const data = new URLSearchParams();
    data.append('pid', this.props.pid);
    data.append('text', this.state.text);
    // data.append('user_token', this.props.token);
    if (!!this.state.text) {
      fetch(
        API_BASE + '/api.php?action=do_comment' + token_param(this.props.token),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: data,
        },
      )
        .then(get_json)
        .then((json) => {
          if (json.code !== 0) {
            if (json.msg) alert(json.msg);
            throw new Error(JSON.stringify(json));
          }

          this.setState({
            loading_status: 'done',
            text: '',
          });
          this.area_ref.current.clear();
          this.props.on_complete();
        })
        .catch((e) => {
          console.error(e);
          alert('????????????');
          this.setState({
            loading_status: 'done',
          });
        });
    } else {
      alert('?????????????????????');
      this.setState({
        loading_status: 'done',
      });
    }
  }

  render() {
    const user_token = this.state.token;
    return (
      <form
        onSubmit={this.on_submit.bind(this)}
        className={'reply-form box' + (this.state.text ? ' reply-sticky' : '')}
      >
        <SafeTextarea
          key={this.props.pid}
          ref={this.area_ref}
          id={this.props.pid}
          on_change={this.on_change_bound}
          on_submit={this.on_submit.bind(this)}
        />
        {this.state.loading_status === 'loading' ? (
          // <button disabled="disabled">
          //   <span className="icon icon-loading" />
          // </button>
          <IconButton aria-label="delete" disabled color="primary">
            <SendIcon />
          </IconButton>
        ) : (
          // <button type="submit">
          //   <span className="icon icon-send" />
          // </button>
          <IconButton aria-label="send" color="primary" type="submit">
            <SendIcon />
          </IconButton>
        )}
      </form>
    );
  }
}

export class PostForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      loading_status: 'done',
      img_tip: null,
    };
    this.img_ref = React.createRef();
    this.area_ref = React.createRef();
    this.on_change_bound = this.on_change.bind(this);
    this.on_img_change_bound = this.on_img_change.bind(this);
    this.do_post;
  }

  componentDidMount() {
    if (this.area_ref.current) this.area_ref.current.focus();
  }

  on_change(value) {
    this.setState({
      text: value,
    });
  }

  do_post(text, img, imgtype) {
    const data = new URLSearchParams();
    data.append('text', this.state.text);
    data.append('type', img ? 'image' : 'text');
    // data.append('user_token', this.props.token);
    if (img) data.append('data', img);
    if (imgtype) data.append('imgtype', imgtype);

    fetch(
      API_BASE + '/api.php?action=do_post' + token_param(this.props.token),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      },
    )
      .then(get_json)
      .then((json) => {
        if (json.code !== 0) {
          if (json.msg) alert(json.msg);
          throw new Error(JSON.stringify(json));
        }

        this.setState({
          loading_status: 'done',
          text: '',
        });
        this.area_ref.current.clear();
        this.props.on_complete();
      })
      .catch((e) => {
        console.error(e);
        alert('????????????');
        this.setState({
          loading_status: 'done',
        });
      });
  }

  proc_img(file) {
    return new Promise((resolve, reject) => {
      function return_url(url) {
        const idx = url.indexOf(';base64,');
        if (idx === -1) throw new Error('img not base64 encoded');

        return url.substr(idx + 8);
      }

      const reader = new FileReader();
      function on_got_img(url) {
        const image = new Image();
        image.onload = () => {
          let width = image.width;
          let height = image.height;
          let compressed = false;

          if (width > MAX_IMG_DIAM) {
            height = (height * MAX_IMG_DIAM) / width;
            width = MAX_IMG_DIAM;
            compressed = true;
          }
          if (height > MAX_IMG_DIAM) {
            width = (width * MAX_IMG_DIAM) / height;
            height = MAX_IMG_DIAM;
            compressed = true;
          }
          if (height * width > MAX_IMG_PX) {
            const rate = Math.sqrt((height * width) / MAX_IMG_PX);
            height /= rate;
            width /= rate;
            compressed = true;
          }
          console.log('chosen img size', width, height);

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(image, 0, 0, width, height);

          let quality_l = 0.1,
            quality_r = 0.9,
            quality,
            new_url;
          while (quality_r - quality_l >= 0.03) {
            quality = (quality_r + quality_l) / 2;
            new_url = canvas.toDataURL('image/jpeg', quality);
            console.log(
              quality_l,
              quality_r,
              'trying quality',
              quality,
              'size',
              new_url.length,
            );
            if (new_url.length <= MAX_IMG_FILESIZE) quality_l = quality;
            else quality_r = quality;
          }
          if (quality_l >= 0.101) {
            console.log('chosen img quality', quality);
            resolve({
              img: return_url(new_url),
              quality: quality,
              width: Math.round(width),
              height: Math.round(height),
              compressed: compressed,
            });
          } else {
            reject('???????????????????????????');
          }
        };
        image.src = url;
      }
      reader.onload = (event) => {
        fixOrientation(event.target.result, {}, (fixed_dataurl) => {
          on_got_img(fixed_dataurl);
        });
      };
      console.log(file);
      reader.readAsDataURL(file);
    });
  }

  on_img_change() {
    if (this.img_ref.current && this.img_ref.current.files.length)
      this.setState(
        {
          img_tip: '??????????????????????????????',
        },
        () => {
          this.proc_img(this.img_ref.current.files[0])
            .then((d) => {
              this.setState({
                img_tip:
                  `???${d.compressed ? '?????????' : '??????'} ${d.width}*${
                    d.height
                  } / ` +
                  `?????? ${Math.floor(d.quality * 100)}% / ${Math.floor(
                    d.img.length / BASE64_RATE / 1000,
                  )}KB???`,
              });
            })
            .catch((e) => {
              this.setState({
                img_tip: `???????????????${e}`,
              });
            });
        },
      );
    else
      this.setState({
        img_tip: null,
      });
  }

  on_submit(event) {
    if (event) event.preventDefault();
    if (this.state.loading_status === 'loading') return;
    if (this.img_ref.current.files.length) {
      this.setState({
        loading_status: 'processing',
      });
      this.proc_img(this.img_ref.current.files[0])
        .then((d) => {
          this.setState({
            loading_status: 'loading',
          });
          if (this.state.text || d.img) {
            this.do_post(
              this.state.text,
              d.img,
              this.img_ref.current.files[0].name,
            );
          }
        })
        .catch((e) => {
          alert(e);
        });
    } else {
      this.setState({
        loading_status: 'loading',
      });
      if (!!this.state.text) {
        this.do_post(this.state.text, null, null);
      } else {
        alert('???????????????');
        this.setState({
          loading_status: 'done',
        });
      }
    }
  }

  render() {
    return (
      <form onSubmit={this.on_submit.bind(this)} className="post-form box">
        <div className="post-form-bar">
          {/* <label>
            <input
              ref={this.img_ref}
              type="file"
              accept="image/*"
              disabled={this.state.loading_status !== 'done'}
              onChange={this.on_img_change_bound}
            />
          </label> */}
          <label>
            <input
              ref={this.img_ref}
              type="file"
              accept="image/*"
              disabled={this.state.loading_status !== 'done'}
              onChange={this.on_img_change_bound}
              //????????????????????????????????????????????????
              className="chooseimg"
            />
            <Button
              variant="contained"
              component="span"
              startIcon={<AddPhotoAlternateIcon />}
              className="sendbtn"
            >
              Upload
            </Button>
          </label>
          {this.state.loading_status !== 'done' ? (
            // <button disabled="disabled">
            //   <span className="icon icon-loading" />
            //   &nbsp;??????
            //   {this.state.loading_status === 'processing' ? '??????' : '??????'}
            // </button>
            <Button
              disabled
              variant="outlined"
              startIcon={<CachedIcon />}
              // className="sendbtn"
            >
              &nbsp;??????
              {this.state.loading_status === 'processing' ? '??????' : '??????'}
            </Button>
          ) : (
            // <button type="submit">
            //   <span className="icon icon-send" />
            //   &nbsp;??????
            // </button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SendIcon />}
              // className="sendbtn"
            >
              Send
            </Button>
          )}
        </div>
        {!!this.state.img_tip && (
          <p className="post-form-img-tip">
            <a
              onClick={() => {
                this.img_ref.current.value = '';
                this.on_img_change();
              }}
            >
              ????????????
            </a>
            {this.state.img_tip}
          </p>
        )}
        <div className="post-form-box">
          <SafeTextareaPost
            ref={this.area_ref}
            id="new_post"
            on_change={this.on_change_bound}
            on_submit={this.on_submit.bind(this)}
          />
          {/* <p>
          <small> */}
          {/* ?????????
            <a
              href="http://pkuhelper.pku.edu.cn/treehole_rules.html"
              target="_blank"
            >
              ??????????????????
            </a> */}
          {/* ???????????????
          </small>
        </p> */}
        </div>
      </form>
    );
  }
}
