/**
 * Created by admin on 2017/7/8.
 */
/**
 * Cookie plugin
 *
 * Copyright (c) 2006 ziqiu.zhang
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * 使用举例：
 //注： 写入时，subName参数请传递空值或null
 //写入Cookies-值为字符串，即不包含子键
 $.cookie("singleKey", "", "singleKey-value", { expires: 1, path: "/", secure: false })
 //读取Cookies-根据主键
 alert("singleKey:" + $.cookie("singleKey"));

 //写入Cookies-值为对象，则每个属性名为子键的名称，属性值为子键值
 var subNameObj = { subName1: "aaa", subName2: "bbb", subName3: "ccc" };
 $.cookie("multiKey", "", subNameObj, { expires: 1, path: "/", secure: false });
 //读取Cookies-根据主键
 alert("multiKey:" + $.cookie("multiKey"));
 //读取Cookies-根据主键和子键
 alert("multiKey,subName1:" + $.cookie("multiKey", "subName1"));
 *
 */

jQuery.cookie = function(name, subName, value, options)
{
    if (typeof value != 'undefined')
    { // name and value given, set cookie
        options = options || {};
        if (value === null)
        {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString))
        {
            var date;
            if (typeof options.expires == 'number')
            {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else
            {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : ';path=/';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';

        //If value is an object, each property will be a sub key;
        if (typeof value == "object")
        {
            var k = 0;
            var tempResult = "";
            for (var tempValue in value)
            {
                if (k > 0)
                {
                    tempResult += "&";
                }
                tempResult += tempValue + "=" + encodeURIComponent(value[tempValue]);
                k++;
            }
            value = tempResult;
        }
        else
        {
            value = encodeURIComponent(value);
        }

        document.cookie = [name, '=', value, expires, path, domain, secure].join('');
    } else
    { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '')
        {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++)
            {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '='))
                {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));

                    //Search sub key
                    if (typeof subName != 'undefined' && subName != null && subName != "")
                    {
                        var subCookies = cookieValue.toString().split('&');
                        for (var j = 0; j < subCookies.length; j++)
                        {
                            var subCookie = jQuery.trim(subCookies[j]);
                            if (subCookie.substring(0, subName.length + 1) == (subName + '='))
                            {
                                cookieValue = decodeURIComponent(subCookie.substring(subName.length + 1));
                                break;
                            }
                        }
                    }

                    break;
                }

            }
        }
        return cookieValue;
    }
};