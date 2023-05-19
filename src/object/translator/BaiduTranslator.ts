import { request } from '@/utils/request';
import SparkMD5 from 'spark-md5';

type TranslateResponse =
  | {
      from: string;
      to: string;
      trans_result: {
        src: string;
        dst: string;
      }[];
    }
  | {
      error_code: string;
      error_msg: string;
    };
export class BaiduTranslator {
  /** APPID */
  private appid: string;
  /** 随机数, 可为字母或数字的字符串 */
  private salt: string | number = 1435660288;
  /** 请求翻译query, UTF-8 */
  private q: string;
  /** 翻译源语言 */
  private from: string;
  /** 翻译目标语言 */
  private to: string;
  /** 签名 */
  private sign: string;
  /** 秘钥 */
  private key: string;

  constructor({
    appid,
    q,
    from,
    to,
    key,
  }: {
    appid: string;
    q: string;
    from: string;
    to: string;
    key: string;
  }) {
    this.appid = appid;
    this.q = q;
    this.from = from;
    this.to = to;
    this.key = key;
    this.sign = this.getSign();
  }

  getSign() {
    const str1 = this.appid + this.q + this.salt + this.key;
    return SparkMD5.hash(str1);
  }

  setQuery(q: string) {
    this.q = q;
    this.sign = this.getSign();
  }

  async translate() {
    try {
      const result = await request.post<TranslateResponse>(
        'https://fanyi-api.baidu.com/api/trans/vip/translate',
        {
          q: this.q,
          from: this.from,
          to: this.to,
          appid: this.appid,
          salt: this.salt,
          sign: this.sign,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      if ('error_code' in result.data) {
        throw new Error(result.data.error_msg);
      }

      return result.data.trans_result.reduce((acc, cur) => {
        return acc + cur.dst;
      }, '');
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
