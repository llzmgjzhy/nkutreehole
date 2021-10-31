import React, { PureComponent } from 'react';
import { AppSwitcher } from './infrastructure/widgets';
import { InfoSidebar, PostForm } from './UserAction';
import { TokenCtx } from './UserAction';
import Button from '@mui/material/Button';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import ContactsIcon from '@mui/icons-material/Contacts';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import StarsIcon from '@mui/icons-material/Stars';
import Input from '@mui/material/Input';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import './Title.css';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import { Calculate } from '@mui/icons-material';
const flag_re = /^\/\/setflag ([a-zA-Z0-9_]+)=(.*)$/;

const APP_SWITCHER_ROUTER = {
  树洞: 'http://spring-autumn.net/Tree_Hole_Login/Login/',
};

//下拉菜单
export default function MenuListComposition(props) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };
  const handleCloseAttention = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
    props.do_attention();
  };
  const handleCloseMine = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
    props.do_showmine();
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);
  return (
    <div>
      <Button
        ref={anchorRef}
        id="composition-button"
        aria-controls={open ? 'composition-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <StarsIcon />
        <span className="control-btn-label">关注</span>{' '}
      </Button>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom-start' ? 'left top' : 'left bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="composition-menu"
                  aria-labelledby="composition-button"
                  onKeyDown={handleListKeyDown}
                >
                  <MenuItem onClick={handleCloseAttention}>
                    <StarsIcon />
                    关注
                  </MenuItem>
                  <MenuItem onClick={handleCloseMine}>
                    <GpsNotFixedIcon />
                    我的
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
}

//快速拨号
function SpeedDialTooltipOpen(props) {
  const [openDial, setOpenDial] = React.useState(false);
  const handleOpenDial = () => setOpenDial(true);
  const handleCloseDial = () => setOpenDial(false);
  const actions = [
    {
      icon: <AddIcon />,
      name: 'Send',
      onClick: () => {
        props.do_send();
        setOpenDial(false);
      },
    },
    {
      icon: <RefreshIcon />,
      name: 'Refresh',
      onClick: () => {
        props.do_refresh();
        setOpenDial(false);
      },
    },
    {
      icon: <GpsNotFixedIcon />,
      name: 'Mine',
      onClick: () => {
        props.do_showmine();
        setOpenDial(false);
      },
    },
    {
      icon: <StarsIcon />,
      name: 'Attention',
      onClick: () => {
        props.do_attention();
        setOpenDial(false);
      },
    },
    {
      icon: <ContactsIcon />,
      name: 'Me',
      onClick: () => {
        props.do_show_sidebar();
        setOpenDial(false);
      },
    },
  ];
  const actionsNoLogin = [
    {
      icon: <RefreshIcon />,
      name: 'Refresh',
      onClick: () => {
        props.do_refresh();
        setOpenDial(false);
      },
    },
    {
      icon: <ContactsIcon />,
      name: 'Me',
      onClick: () => {
        props.do_show_sidebar();
        setOpenDial(false);
      },
    },
  ];
  return (
    <div>
      <SpeedDial
        ariaLabel="SpeedDial openIcon example"
        sx={{
          // top: window.screen.availHeight - 200,
          position: 'absolute',
          // bottom: 16,
          top: window.screen.availHeight - 450,
          // left: 200,
          right: 16,
        }}
        onClose={handleCloseDial}
        onOpen={handleOpenDial}
        icon={<SpeedDialIcon />}
        open={openDial}
      >
        {props.token
          ? actions.map((action) => (
            <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                tooltipOpen
                onClick={action.onClick}
              />
            ))
          : actionsNoLogin.map((action) => (
            <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                tooltipOpen
                onClick={action.onClick}
              />
            ))}
      </SpeedDial>
    </div>
  );
}

class ControlBar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      search_text: '',
      operation: localStorage['operation'] || 'menu',
    };
    this.set_mode = props.set_mode;

    this.on_change_bound = this.on_change.bind(this);
    this.on_keypress_bound = this.on_keypress.bind(this);
    this.do_refresh_bound = this.do_refresh.bind(this);
    this.do_attention_bound = this.do_attention.bind(this);
    this.do_showmine_bound = this.do_showmine.bind(this);
    this.show_sidebar_bound = this.show_sidebar.bind(this);
    this.show_sidebar_login_bound = this.show_sidebar_login.bind(this);
  }

  componentDidMount() {
    if (window.location.hash) {
      let text = decodeURIComponent(window.location.hash).substr(1);
      if (text.lastIndexOf('?') !== -1)
        text = text.substr(0, text.lastIndexOf('?')); // fuck wechat '#param?nsukey=...'
      this.setState(
        {
          search_text: text,
        },
        () => {
          this.on_keypress({ key: 'Enter' });
        },
      );
    }
  }
  on_change(event) {
    this.setState({
      search_text: event.target.value,
    });
  }

  on_keypress(event) {
    if (event.key === 'Enter') {
      const flag_res = flag_re.exec(this.state.search_text);
      if (flag_res) {
        if (flag_res[2]) {
          localStorage[flag_res[1]] = flag_res[2];
          alert(
            'Set Flag ' +
              flag_res[1] +
              '=' +
              flag_res[2] +
              '\nYou may need to refresh this webpage.',
          );
        } else {
          delete localStorage[flag_res[1]];
          alert(
            'Clear Flag ' +
              flag_res[1] +
              '\nYou may need to refresh this webpage.',
          );
        }
        return;
      }

      const mode = this.state.search_text.startsWith('#')
        ? 'search'
        : this.props.mode !== 'attention'
        ? 'search'
        : 'attention';
      this.set_mode(mode, this.state.search_text || '');
    }
  }

  do_refresh() {
    window.scrollTo(0, 0);
    this.setState({
      search_text: '',
    });
    this.set_mode('list', null);
  }

  do_attention() {
    window.scrollTo(0, 0);
    this.setState({
      search_text: '',
    });
    this.set_mode('attention', null);
  }
  do_showmine() {
    window.scrollTo(0, 0);
    this.setState({
      search_text: '',
    });
    this.set_mode('mine', null);
  }
  show_sidebar() {
    // location.hash = 'postsidebar';
    history.pushState(null, null, 'postsidebar.html');
    this.props.show_sidebar(
      '发表树洞',
      <PostForm
        token={this.props.token}
        on_complete={() => {
          this.props.show_sidebar(null, null, 'clear');
          this.do_refresh();
        }}
      />,
    );
  }
  show_sidebar_login() {
    history.pushState(null, null, 'index.html');
    this.props.show_sidebar(
      '用户登陆',
      <InfoSidebar
        show_sidebar={this.props.show_sidebar}
        set_mode={this.props.set_mode}
        token={this.props.token}
      />,
    );
  }

  render() {
    return (
      <TokenCtx.Consumer>
        {({ value: token }) => (
          <div>
            <div className="control-bar">
              {/* <a
              className="no-underline control-btn"
              onClick={this.do_refresh_bound}
            >
              <span className="icon icon-refresh" />
              <span className="control-btn-label">最新</span>
            </a> */}
              {this.state.operation === 'menu' && (
                <Button
                  variant="text"
                  onClick={this.do_refresh_bound}
                  className="button-title"
                  // size="small"
                >
                  <RefreshIcon />
                  <span className="control-btn-label">最新</span>
                </Button>
              )}
              {this.state.operation === 'menu' &&
                (!!token ? (
                  // <a
                  //   className="no-underline control-btn"
                  //   onClick={this.do_attention_bound}
                  // >
                  //   <span className="icon icon-attention" />
                  //   <span className="control-btn-label">关注</span>
                  // </a>
                  // <Button
                  //   variant="text"
                  //   onClick={this.do_attention_bound}
                  //   className="button-title"
                  // >
                  //   <StarsIcon />
                  //   <span className="control-btn-label">关注</span>
                  // </Button>
                  <MenuListComposition
                    do_attention={this.do_attention_bound}
                    do_showmine={this.do_showmine_bound}
                  />
                ) : (
                  ''
                ))}
              <Input
                className="control-search"
                value={this.state.search_text}
                placeholder={`${
                  this.props.mode === 'attention' ? '在关注中' : ''
                }搜索 或 #PID`}
                onChange={this.on_change_bound}
                onKeyPress={this.on_keypress_bound}
              />
              {/* <a
              className="no-underline control-btn"
              onClick={() => {
                this.show_sidebar_login();
              }}
            >
              <span className={'icon icon-' + (token ? 'about' : 'login')} />
              <span className="control-btn-label">
                {token ? '账户' : '登录'}
              </span>
            </a> */}
              {this.state.operation === 'menu' &&
                (token ? (
                  <Button
                    variant="text"
                    onClick={() => {
                      this.show_sidebar_login();
                    }}
                    className="button-title"
                  >
                    <ContactsIcon />
                    <span className="control-btn-label">账户</span>
                  </Button>
                ) : (
                  <Button
                    variant="text"
                    onClick={() => {
                      this.show_sidebar_login();
                    }}
                    className="button-title"
                  >
                    <PermIdentityIcon />
                    <span className="control-btn-label">登录</span>
                  </Button>
                ))}
              {this.state.operation === 'menu' &&
                //点击显示提交栏，在本地声明了show_sidebar函数
                // <a
                //   className="no-underline control-btn"
                //   onClick={() => {
                //     this.show_sidebar();
                //   }}
                // >
                //   <span className="icon icon-plus" />
                //   {/* <svg data-testid="AddIcon"></svg> */}
                //   <span className="control-btn-label">发表</span>
                // </a>
                (!!token ? (
                  <Button
                    variant="text"
                    onClick={() => {
                      this.show_sidebar();
                    }}
                    className="button-title"
                  >
                    <AddCircleIcon />
                    <span className="control-btn-label">发表</span>
                  </Button>
                ) : (
                  ''
                ))}
            </div>
            {this.state.operation === 'button' && (
              <SpeedDialTooltipOpen
                do_refresh={this.do_refresh_bound}
                do_attention={this.do_attention_bound}
                do_showmine={this.do_showmine_bound}
                do_show_sidebar={this.show_sidebar_login_bound}
                do_send={this.show_sidebar_bound}
                token={token}
              />
            )}
          </div>
        )}
      </TokenCtx.Consumer>
    );
  }
}

class AppSwitcherHusk extends PureComponent {
  render() {
    return (
      <div id="app-switcher-shell">
        <AppSwitcher appid="hole" />
      </div>
    );
  }

  componentDidMount() {
    const appSwitcher =
      document.getElementById('app-switcher-shell').firstChild;
    const appList = appSwitcher.querySelectorAll('a');
    appList.forEach((el) => {
      if (el.text in APP_SWITCHER_ROUTER)
        el.href = APP_SWITCHER_ROUTER[el.text];
      else if (el.text !== '更多▾') {
        el.href = 'https://pkuhelper.pku.edu.cn' + el.pathname;
        el.style = 'filter: grayscale(100%); opacity: 0.25';
        el.title = '可能失效的按钮';
      }

      if (el.text === '树洞') el.title = '官方版树洞';
    });
  }
}

export function Title(props) {
  return (
    <div className="title-bar">
      {/* <AppSwitcher appid="hole" /> */}
      <AppSwitcherHusk />
      <div className="aux-margin">
        <div className="title">
          <p className="centered-line">
            <span
            // onClick={() =>
            //   props.show_sidebar(
            //     'P大树洞 (社区版)',
            //     <InfoSidebar show_sidebar={props.show_sidebar} />,
            //   )
            // }
            >
              NKU树洞
              <small>
                {' '}
                {!!process.env.REACT_APP_VERSION.includes('beta') && (
                  <sup>β</sup>
                )}
                {!!process.env.REACT_APP_VERSION.includes('alpha') && (
                  <sup>α</sup>
                )}
              </small>
            </span>
          </p>
        </div>
        <ControlBar
          show_sidebar={props.show_sidebar}
          set_mode={props.set_mode}
          mode={props.mode}
          token={props.token}
        />
      </div>
    </div>
  );
}
