import { get_json, API_VERSION_PARAM } from './infrastructure/functions';
import { NKUHELPER_ROOT } from './infrastructure/const';
import { API_BASE } from './Common';
import { cache } from './cache';

export { NKUHELPER_ROOT, API_VERSION_PARAM };

export function token_param(token) {
  return API_VERSION_PARAM() + (token ? '&user_token=' + token : '');
}

export { get_json };

const SEARCH_PAGESIZE = 50;

const handle_response = async (response, notify = false) => {
  const json = await get_json(response);
  if (json.code !== 0) {
    if (json) {
      if (notify) alert(json.msg);
      else throw new Error(json.msg);
    } else throw new Error(JSON.stringify(json));
  }
  return json;
};

const parse_replies = (replies, color_picker) =>
  replies
    .sort((a, b) => parseInt(a.cid, 10) - parseInt(b.cid, 10))
    .map((info) => {
      info._display_color = color_picker.get(info.name);
      info.variant = {};
      return info;
    });

export const API = {
  load_replies: async (pid, token, color_picker, cache_version) => {
    pid = parseInt(pid);
    const response = await fetch(
      // '//39.105.113.112/Tree_Hole/api.php?action=get_comment' + '&pid=' + pid,
      API_BASE + 'api.php?action=get_comment' + '&pid=' + pid,
    );
    const json = await handle_response(response);
    // Helper warnings are not cacheable
    if (json.data.length !== 1 || !json.data[0].text.startsWith('[Helper]')) {
      cache().put(pid, cache_version, json);
    }
    json.data = parse_replies(json.data, color_picker);
    return json;
  },

  load_replies_with_cache: async (pid, token, color_picker, cache_version) => {
    pid = parseInt(pid);
    let json = await cache().get(pid, cache_version);
    if (json) {
      json.data = parse_replies(json.data, color_picker);
      return { data: json, cached: true };
    } else {
      json = await API.load_replies(pid, token, color_picker, cache_version);
      return { data: json, cached: !json };
    }
  },

  set_attention: async (pid, attention, token) => {
    const data = new URLSearchParams();
    data.append('user_token', token);
    data.append('pid', pid);
    data.append('switch', attention ? '1' : '0');
    const response = await fetch(
      API_BASE + '/api.php?action=attention' + token_param(token),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      },
    );
    // Delete cache to update `attention` on next reload
    cache().delete(pid);
    return handle_response(response, true);
  },

  report: async (pid, reason, token) => {
    const data = new URLSearchParams();
    data.append('user_token', token);
    data.append('pid', pid);
    data.append('reason', reason);
    const response = await fetch(
      API_BASE + '/api.php?action=report' + token_param(token),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data,
      },
    );
    return handle_response(response, true);
  },

  get_list: async (page, token) => {
    const response = await fetch(
      // '//39.105.113.112/Tree_Hole/api.php?action=get_list' + '&p=' + page,
      API_BASE + 'api.php?action=get_list' + '&p=' + page,
    );
    return handle_response(response);
  },

  get_search: async (page, keyword, token) => {
    const response = await fetch(
      API_BASE +
        '/api.php?action=search' +
        '&pagesize=' +
        SEARCH_PAGESIZE +
        '&page=' +
        page +
        '&keywords=' +
        encodeURIComponent(keyword) +
        token_param(token),
    );
    return handle_response(response);
  },

  get_single: async (pid, token) => {
    const response = await fetch(
      API_BASE + '/api.php?action=getone' + '&pid=' + pid + token_param(token),
    );
    return handle_response(response);
  },

  get_attention: async (token) => {
    const response = await fetch(
      API_BASE + '/api.php?action=get_attention' + token_param(token),
    );
    return handle_response(response);
  },
  get_mine: async (token) => {
    const response = await fetch(
      API_BASE + '/api.php?action=get_mine' + token_param(token),
    );
    return handle_response(response);
  },
};
