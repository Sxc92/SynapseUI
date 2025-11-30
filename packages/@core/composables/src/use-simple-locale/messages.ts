export type Locale = 'en-US' | 'zh-CN' | 'ja-JP' | 'ko-KR' | 'cs-CZ';

export const messages: Record<Locale, Record<string, string>> = {
  'en-US': {
    cancel: 'Cancel',
    collapse: 'Collapse',
    confirm: 'Confirm',
    expand: 'Expand',
    prompt: 'Prompt',
    reset: 'Reset',
    submit: 'Submit',
  },
  'zh-CN': {
    cancel: '取消',
    collapse: '收起',
    confirm: '确认',
    expand: '展开',
    prompt: '提示',
    reset: '重置',
    submit: '提交',
  },
  'ja-JP': {
    cancel: 'キャンセル',
    collapse: '折りたたむ',
    confirm: '確認',
    expand: '展開',
    prompt: 'プロンプト',
    reset: 'リセット',
    submit: '送信',
  },
  'ko-KR': {
    cancel: '취소',
    collapse: '접기',
    confirm: '확인',
    expand: '펼치기',
    prompt: '프롬프트',
    reset: '재설정',
    submit: '제출',
  },
  'cs-CZ': {
    cancel: 'Zrušit',
    collapse: 'Sbalit',
    confirm: 'Potvrdit',
    expand: 'Rozbalit',
    prompt: 'Výzva',
    reset: 'Obnovit',
    submit: 'Odeslat',
  },
};

export const getMessages = (locale: Locale) => messages[locale];
