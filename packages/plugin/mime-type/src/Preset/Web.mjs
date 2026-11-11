import * as Charset from './Charset.mjs';

export const MIME_TYPE = Symbol('item.mimeType');
export const ALIAS_LIST = Symbol('item.aliasList');
export const CHARSET_LIST = Symbol('item.charsetList');
import * as WHATWG_application_ecmascript from '@produck/meta-whatwg-mime/application/ecmascript';
import * as WHATWG_application_font_cff from '@produck/meta-whatwg-mime/application/font-cff';
import * as WHATWG_application_font_otf from '@produck/meta-whatwg-mime/application/font-otf';
import * as WHATWG_application_font_sfnt from '@produck/meta-whatwg-mime/application/font-sfnt';
import * as WHATWG_application_font_ttf from '@produck/meta-whatwg-mime/application/font-ttf';
import * as WHATWG_application_font_woff from '@produck/meta-whatwg-mime/application/font-woff';
import * as WHATWG_application_javascript from '@produck/meta-whatwg-mime/application/javascript';
import * as WHATWG_application_json from '@produck/meta-whatwg-mime/application/json';
import * as WHATWG_application_octet_stream from '@produck/meta-whatwg-mime/application/octet-stream';
import * as WHATWG_application_ogg from '@produck/meta-whatwg-mime/application/ogg';
import * as WHATWG_application_pdf from '@produck/meta-whatwg-mime/application/pdf';
import * as WHATWG_application_postscript from '@produck/meta-whatwg-mime/application/postscript';
import * as WHATWG_application_unknown from '@produck/meta-whatwg-mime/application/unknown';
import * as WHATWG_application_vnd_ms_fontobject from '@produck/meta-whatwg-mime/application/vnd.ms-fontobject';
import * as WHATWG_application_vnd_ms_opentype from '@produck/meta-whatwg-mime/application/vnd.ms-opentype';
import * as WHATWG_application_x_ecmascript from '@produck/meta-whatwg-mime/application/x-ecmascript';
import * as WHATWG_application_x_gzip from '@produck/meta-whatwg-mime/application/x-gzip';
import * as WHATWG_application_x_javascript from '@produck/meta-whatwg-mime/application/x-javascript';
import * as WHATWG_application_x_rar_compressed from '@produck/meta-whatwg-mime/application/x-rar-compressed';
import * as WHATWG_application_xml from '@produck/meta-whatwg-mime/application/xml';
import * as WHATWG_application_zip from '@produck/meta-whatwg-mime/application/zip';
import * as WHATWG_audio_aiff from '@produck/meta-whatwg-mime/audio/aiff';
import * as WHATWG_audio_midi from '@produck/meta-whatwg-mime/audio/midi';
import * as WHATWG_audio_mpeg from '@produck/meta-whatwg-mime/audio/mpeg';
import * as WHATWG_audio_wave from '@produck/meta-whatwg-mime/audio/wave';
import * as WHATWG_font_collection from '@produck/meta-whatwg-mime/font/collection';
import * as WHATWG_font_otf from '@produck/meta-whatwg-mime/font/otf';
import * as WHATWG_font_ttf from '@produck/meta-whatwg-mime/font/ttf';
import * as WHATWG_font_woff from '@produck/meta-whatwg-mime/font/woff';
import * as WHATWG_font_woff2 from '@produck/meta-whatwg-mime/font/woff2';
import * as WHATWG_image_bmp from '@produck/meta-whatwg-mime/image/bmp';
import * as WHATWG_image_gif from '@produck/meta-whatwg-mime/image/gif';
import * as WHATWG_image_jpeg from '@produck/meta-whatwg-mime/image/jpeg';
import * as WHATWG_image_png from '@produck/meta-whatwg-mime/image/png';
import * as WHATWG_image_svg_xml from '@produck/meta-whatwg-mime/image/svg+xml';
import * as WHATWG_image_webp from '@produck/meta-whatwg-mime/image/webp';
import * as WHATWG_image_x_icon from '@produck/meta-whatwg-mime/image/x-icon';
import * as WHATWG_text_cache_manifest from '@produck/meta-whatwg-mime/text/cache-manifest';
import * as WHATWG_text_ecmascript from '@produck/meta-whatwg-mime/text/ecmascript';
import * as WHATWG_text_html from '@produck/meta-whatwg-mime/text/html';
import * as WHATWG_text_javascript from '@produck/meta-whatwg-mime/text/javascript';
import * as WHATWG_text_javascript1_0 from '@produck/meta-whatwg-mime/text/javascript1.0';
import * as WHATWG_text_javascript1_1 from '@produck/meta-whatwg-mime/text/javascript1.1';
import * as WHATWG_text_javascript1_2 from '@produck/meta-whatwg-mime/text/javascript1.2';
import * as WHATWG_text_javascript1_3 from '@produck/meta-whatwg-mime/text/javascript1.3';
import * as WHATWG_text_javascript1_4 from '@produck/meta-whatwg-mime/text/javascript1.4';
import * as WHATWG_text_javascript1_5 from '@produck/meta-whatwg-mime/text/javascript1.5';
import * as WHATWG_text_jscript from '@produck/meta-whatwg-mime/text/jscript';
import * as WHATWG_text_json from '@produck/meta-whatwg-mime/text/json';
import * as WHATWG_text_livescript from '@produck/meta-whatwg-mime/text/livescript';
import * as WHATWG_text_plain from '@produck/meta-whatwg-mime/text/plain';
import * as WHATWG_text_vtt from '@produck/meta-whatwg-mime/text/vtt';
import * as WHATWG_text_x_ecmascript from '@produck/meta-whatwg-mime/text/x-ecmascript';
import * as WHATWG_text_x_javascript from '@produck/meta-whatwg-mime/text/x-javascript';
import * as WHATWG_text_xml from '@produck/meta-whatwg-mime/text/xml';
import * as WHATWG_unknown_unknown from '@produck/meta-whatwg-mime/unknown/unknown';
import * as WHATWG_video_avi from '@produck/meta-whatwg-mime/video/avi';
import * as WHATWG_video_mp4 from '@produck/meta-whatwg-mime/video/mp4';
import * as WHATWG_video_webm from '@produck/meta-whatwg-mime/video/webm';

import * as APACHE_application_ecmascript from '@produck/meta-apache-mime-extension/application/ecmascript';
import * as APACHE_application_json from '@produck/meta-apache-mime-extension/application/json';
import * as APACHE_application_octet_stream from '@produck/meta-apache-mime-extension/application/octet-stream';
import * as APACHE_application_ogg from '@produck/meta-apache-mime-extension/application/ogg';
import * as APACHE_application_pdf from '@produck/meta-apache-mime-extension/application/pdf';
import * as APACHE_application_postscript from '@produck/meta-apache-mime-extension/application/postscript';
import * as APACHE_application_vnd_ms_fontobject from '@produck/meta-apache-mime-extension/application/vnd.ms-fontobject';
import * as APACHE_application_x_rar_compressed from '@produck/meta-apache-mime-extension/application/x-rar-compressed';
import * as APACHE_application_xml from '@produck/meta-apache-mime-extension/application/xml';
import * as APACHE_application_zip from '@produck/meta-apache-mime-extension/application/zip';
import * as APACHE_audio_midi from '@produck/meta-apache-mime-extension/audio/midi';
import * as APACHE_audio_mpeg from '@produck/meta-apache-mime-extension/audio/mpeg';
import * as APACHE_font_collection from '@produck/meta-apache-mime-extension/font/collection';
import * as APACHE_font_otf from '@produck/meta-apache-mime-extension/font/otf';
import * as APACHE_font_ttf from '@produck/meta-apache-mime-extension/font/ttf';
import * as APACHE_font_woff from '@produck/meta-apache-mime-extension/font/woff';
import * as APACHE_font_woff2 from '@produck/meta-apache-mime-extension/font/woff2';
import * as APACHE_image_bmp from '@produck/meta-apache-mime-extension/image/bmp';
import * as APACHE_image_gif from '@produck/meta-apache-mime-extension/image/gif';
import * as APACHE_image_jpeg from '@produck/meta-apache-mime-extension/image/jpeg';
import * as APACHE_image_png from '@produck/meta-apache-mime-extension/image/png';
import * as APACHE_image_svg_xml from '@produck/meta-apache-mime-extension/image/svg+xml';
import * as APACHE_image_webp from '@produck/meta-apache-mime-extension/image/webp';
import * as APACHE_image_x_icon from '@produck/meta-apache-mime-extension/image/x-icon';
import * as APACHE_text_cache_manifest from '@produck/meta-apache-mime-extension/text/cache-manifest';
import * as APACHE_text_html from '@produck/meta-apache-mime-extension/text/html';
import * as APACHE_text_javascript from '@produck/meta-apache-mime-extension/text/javascript';
import * as APACHE_text_plain from '@produck/meta-apache-mime-extension/text/plain';
import * as APACHE_video_mp4 from '@produck/meta-apache-mime-extension/video/mp4';
import * as APACHE_video_webm from '@produck/meta-apache-mime-extension/video/webm';

export const Web = Object.freeze([
  {
    [MIME_TYPE]: WHATWG_application_ecmascript.mediaType,
    [ALIAS_LIST]: Object.freeze([
      ...APACHE_application_ecmascript.extensionList,
    ]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_font_cff.mediaType,
    [ALIAS_LIST]: Object.freeze(['cff']),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_font_otf.mediaType,
    [ALIAS_LIST]: Object.freeze(['otf']),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_font_sfnt.mediaType,
    [ALIAS_LIST]: Object.freeze(['sfnt']),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_font_ttf.mediaType,
    [ALIAS_LIST]: Object.freeze(['ttf']),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_font_woff.mediaType,
    [ALIAS_LIST]: Object.freeze(['woff']),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_javascript.mediaType,
    [ALIAS_LIST]: Object.freeze(['js']),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_json.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_application_json.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_octet_stream.mediaType,
    [ALIAS_LIST]: Object.freeze([
      ...APACHE_application_octet_stream.extensionList,
    ]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_ogg.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_application_ogg.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_pdf.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_application_pdf.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_postscript.mediaType,
    [ALIAS_LIST]: Object.freeze([
      ...APACHE_application_postscript.extensionList,
    ]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_unknown.mediaType,
    [ALIAS_LIST]: Charset.EMPTY,
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_vnd_ms_fontobject.mediaType,
    [ALIAS_LIST]: Object.freeze([
      ...APACHE_application_vnd_ms_fontobject.extensionList,
    ]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_vnd_ms_opentype.mediaType,
    [ALIAS_LIST]: Charset.EMPTY,
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_x_ecmascript.mediaType,
    [ALIAS_LIST]: Charset.EMPTY,
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_x_gzip.mediaType,
    [ALIAS_LIST]: Object.freeze(['gz']),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_x_javascript.mediaType,
    [ALIAS_LIST]: Charset.EMPTY,
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_x_rar_compressed.mediaType,
    [ALIAS_LIST]: Object.freeze([
      ...APACHE_application_x_rar_compressed.extensionList,
    ]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_xml.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_application_xml.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_application_zip.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_application_zip.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_audio_aiff.mediaType,
    [ALIAS_LIST]: Object.freeze(['aiff', 'aif']),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_audio_midi.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_audio_midi.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_audio_mpeg.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_audio_mpeg.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_audio_wave.mediaType,
    [ALIAS_LIST]: Object.freeze(['wav']),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_font_collection.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_font_collection.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_font_otf.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_font_otf.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_font_ttf.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_font_ttf.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_font_woff.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_font_woff.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_font_woff2.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_font_woff2.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_image_bmp.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_image_bmp.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_image_gif.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_image_gif.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_image_jpeg.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_image_jpeg.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_image_png.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_image_png.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_image_svg_xml.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_image_svg_xml.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_image_webp.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_image_webp.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_image_x_icon.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_image_x_icon.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_text_cache_manifest.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_text_cache_manifest.extensionList]),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_ecmascript.mediaType,
    [ALIAS_LIST]: Charset.EMPTY,
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_html.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_text_html.extensionList]),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_javascript.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_text_javascript.extensionList]),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_javascript1_0.mediaType,
    [ALIAS_LIST]: Object.freeze(['javascript1.0']),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_javascript1_1.mediaType,
    [ALIAS_LIST]: Object.freeze(['javascript1.1']),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_javascript1_2.mediaType,
    [ALIAS_LIST]: Object.freeze(['javascript1.2']),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_javascript1_3.mediaType,
    [ALIAS_LIST]: Object.freeze(['javascript1.3']),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_javascript1_4.mediaType,
    [ALIAS_LIST]: Object.freeze(['javascript1.4']),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_javascript1_5.mediaType,
    [ALIAS_LIST]: Object.freeze(['javascript1.5']),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_jscript.mediaType,
    [ALIAS_LIST]: Object.freeze(['jscript']),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_json.mediaType,
    [ALIAS_LIST]: Object.freeze(['json']),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_livescript.mediaType,
    [ALIAS_LIST]: Object.freeze(['livescript']),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_plain.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_text_plain.extensionList]),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_vtt.mediaType,
    [ALIAS_LIST]: Object.freeze(['vtt']),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_x_ecmascript.mediaType,
    [ALIAS_LIST]: Charset.EMPTY,
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_x_javascript.mediaType,
    [ALIAS_LIST]: Charset.EMPTY,
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_text_xml.mediaType,
    [ALIAS_LIST]: Object.freeze(['xml']),
    [CHARSET_LIST]: Charset.ANY,
  },
  {
    [MIME_TYPE]: WHATWG_unknown_unknown.mediaType,
    [ALIAS_LIST]: Charset.EMPTY,
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_video_avi.mediaType,
    [ALIAS_LIST]: Object.freeze(['avi']),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_video_mp4.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_video_mp4.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
  {
    [MIME_TYPE]: WHATWG_video_webm.mediaType,
    [ALIAS_LIST]: Object.freeze([...APACHE_video_webm.extensionList]),
    [CHARSET_LIST]: Charset.EMPTY,
  },
]);
