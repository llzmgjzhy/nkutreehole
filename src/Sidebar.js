import { BackHandler, Platform } from 'react-native';
import React, { PureComponent } from 'react';
import './Sidebar.css';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export class Sidebar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      is_imgShow: props.is_imgShow,
    };
    // this.sidebar_ref = React.createRef();
    this.do_close_bound = this.do_close.bind(this);
    this.do_back_bound = this.do_back.bind(this);
    this.do_close_userback_bind = this.do_close_userback.bind(this);
    this.judge_do_close_bind = this.judge_do_close.bind(this);
    // this.componentDidMount = this.componentDidMount.bind(this);
    // this.componentWillUnmount = this.componentWillUnmount.bind(this);
  }

  do_close() {
    // if (Platform.OS === 'web') {
    //   alert('确定要关闭吗');
    // }
    const is_ipad = /iPhone|iPad/i.test(window.navigator.userAgent);
    this.props.show_sidebar(null, null, 'clear');
    if (!is_ipad) {
      window.history.back();
    }
  }
  do_back() {
    // const is_ipad = /iPhone|iPad/i.test(window.navigator.userAgent);
    this.props.show_sidebar(null, null, 'pop');
    // if (!is_ipad) {
    //   window.history.back();
    // }
  }
  do_close_userback() {
    this.props.show_sidebar(null, null, 'clear');
    return true;
  }
  judge_do_close() {
    if (!this.state.is_imgShow) {
      this.props.show_sidebar(null, null, 'clear');
    }
  }
  componentDidMount() {
    // setInterval(() => {
    //   console.log(this.state.is_imgShow);
    // }, 1000);
    // if (window.history && window.history.pushState) {
    //   history.pushState(null, null, document.URL);
    //   window.addEventListener('popstate', this.do_close_android, false);
    // }
    window.addEventListener('popstate', this.do_close_userback_bind);
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this.do_close_userback_bind, false);
  }

  render() {
    // hide old contents to remember state
    const contents = this.props.stack.map(
      ({ 1: content }, i) =>
        content && (
          <div
            key={i}
            className={
              'sidebar-content ' +
              (i === this.props.stack.length - 1
                ? 'sidebar-content-show'
                : 'sidebar-content-hide')
            }
          >
            {content}
          </div>
        ),
    );
    const cur_title = this.props.stack[this.props.stack.length - 1][0];
    return (
      <div
        className={
          'sidebar-container ' +
          (cur_title !== null ? 'sidebar-on' : 'sidebar-off')
        }
      >
        <div
          className="sidebar-shadow"
          onClick={this.do_close_bound}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.target.click();
          }}
        />
        <div className="sidebar">{contents}</div>
        <div className="sidebar-title">
          <a className="no-underline closeicon" onClick={this.do_close_bound}>
            &nbsp;
            {/* <span className="icon icon-close" /> */}
            <IconButton aria-label="close" style={{ bottom: 2 }}>
              <CloseIcon />
            </IconButton>
            &nbsp;
          </a>
          {this.props.stack.length > 2 && (
            <a className="no-underline" onClick={this.do_back_bound}>
              &nbsp;
              <span className="icon icon-back" />
              &nbsp;
            </a>
          )}
          {cur_title}
        </div>
      </div>
    );
  }
}
