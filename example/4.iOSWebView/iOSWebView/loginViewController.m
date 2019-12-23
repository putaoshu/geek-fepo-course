//
//  loginViewController.m
//  iOSWebView
//
//  Copyright © 2019 putaoshu. Licensed under the MIT license.
//

#import "loginViewController.h"
#import <WebKit/WebKit.h>

@interface loginViewController ()<WKNavigationDelegate,WKUIDelegate,WKScriptMessageHandler,UINavigationControllerDelegate>{
    
}
@property(nonatomic, strong)WKWebView *webView;
@end

@implementation loginViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    //self.title = @"JSSDKNativeViewController";
    self.view.backgroundColor = [UIColor whiteColor];
    
    [self initWKWebView];
}
//+ (WKWebsiteDataStore *)defaultDataStore;

- (void)initWKWebView{
    //创建并配置WKWebView的相关参数
    //1.WKWebViewConfiguration:是WKWebView初始化时的配置类，里面存放着初始化WK的一系列属性；
    //2.WKUserContentController:为JS提供了一个发送消息的通道并且可以向页面注入JS的类，WKUserContentController对象可以添加多个scriptMessageHandler；
    //3.addScriptMessageHandler:name:有两个参数，第一个参数是userContentController的代理对象，第二个参数是JS里发送postMessage的对象。添加一个脚本消息的处理器,同时需要在JS中添加，window.webkit.messageHandlers.<name>.postMessage(<messageBody>)才能起作用。
    
    WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
    WKUserContentController *userContentController = [[WKUserContentController alloc] init];
    
    //增加OS对应的Login
    [userContentController addScriptMessageHandler:self name:@"Login"];
    configuration.preferences.javaScriptEnabled = YES;
    configuration.userContentController = userContentController;
    
    //缓存配置
    //configuration.websiteDataStore = [WKWebsiteDataStore defaultDataStore];

    self.webView = [[WKWebView alloc] initWithFrame:self.view.frame configuration:configuration];
    self.webView.navigationDelegate = self;
    self.webView.UIDelegate = self;
    
    //load本地
    //loadFileURL方法通常用于加载服务器的HTML页面或者JS，而loadHTMLString通常用于加载本地HTML或者JS
//    NSString *htmlPath = [[NSBundle mainBundle] pathForResource:@"loginViewController" ofType:@"html"];
//    NSString *appHtml = [NSString stringWithContentsOfFile:htmlPath encoding:NSUTF8StringEncoding error:nil];
//    NSURL *baseURL = [NSURL fileURLWithPath:htmlPath];
//    [self.webView loadHTMLString:appHtml baseURL:baseURL];
    
    //load http
    [self.webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"http://fe.com:8080/code/ios/iOSWebView/iOSWebView/login.html"]]];
    
    [self.view addSubview:self.webView];
}


#pragma mark -- JS调用OC
/**
 *  JS 调用 OC 时 webview 会调用此方法
 *
 *  @param userContentController  webview中配置的userContentController 信息
 *  @param message                JS执行传递的消息
 */

- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message{
    //JS调用OC方法
    
    //message.boby就是JS里传过来的参数
    NSLog(@"body:%@",message.body);
    
    if ([message.name isEqualToString:@"Login"]) {
        [self loginHandle:message.body];
    }
}

#pragma mark - Method
- (void)loginHandle:(NSDictionary *)dic{
    if (![dic isKindOfClass:[NSDictionary class]]) {
        return;
    }
    
    NSString *username = [dic objectForKey:@"username"];
    NSString *password = [dic objectForKey:@"password"];
    
    NSString *cookieName = @"username";
    NSString *cookieDomain = @"http://fe.com";
    
    NSHTTPCookie *cookie = [self cookieWithName:cookieName];
    NSLog(@"cookie%@", cookie);
    
    [self saveCookieWithName:cookieName value:username domain:cookieDomain];
    [self cookiesShareSet];
    
    //OC反馈给JS回调 function loginResult()
    NSString *JSResult = [NSString stringWithFormat:@"loginResult('%@','%@')",username,password];
    
    //OC执行JS
    [self.webView evaluateJavaScript:JSResult completionHandler:^(id _Nullable result, NSError * _Nullable error) {
        //NSLog(@"%@", error);
    }];
    
    //self.webView.navigationDelegate = self;
}

#pragma mark - 加载状态的回调
// 页面开始加载时调用
- (void)webView:(WKWebView *)webView didStartProvisionalNavigation:(WKNavigation *)navigation {
    NSLog(@"页面开始加载");
}
// 当内容开始返回时调用
- (void)webView:(WKWebView *)webView didCommitNavigation:(WKNavigation *)navigation {
    NSLog(@"数据开始返回");
    [self cookiesShareSet];
}
// 页面加载完成之后调用
- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    NSLog(@"页面已经加载完成");
}
// 页面加载失败时调用
- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation {
    NSLog(@"页面加载失败");
}

#pragma mark - WKUIDelegate
- (void)webView:(WKWebView *)webView runJavaScriptAlertPanelWithMessage:(NSString *)message initiatedByFrame:(WKFrameInfo *)frame completionHandler:(void (^)(void))completionHandler{
    
    UIAlertController *alert = [UIAlertController alertControllerWithTitle:@"提醒" message:message preferredStyle:UIAlertControllerStyleAlert];
    [alert addAction:[UIAlertAction actionWithTitle:@"知道了" style:UIAlertActionStyleCancel handler:^(UIAlertAction * _Nonnull action) {
        completionHandler();
    }]];
    
    [self presentViewController:alert animated:YES completion:nil];
}

#pragma cookies
//NSHTTPCookieStorage Cookies共享
//在WkWebView接收到Response后，将Response带的Cookies取出，然后直接放入[NSHTTPCookieStorage sharedHTTPCookieStorage] 容器中
- (void)webView:(WKWebView *)webView decidePolicyForNavigationResponse:(WKNavigationResponse *)navigationResponse decisionHandler:(void (^)(WKNavigationResponsePolicy))decisionHandler{
    NSHTTPURLResponse *response = (NSHTTPURLResponse *)navigationResponse.response;
    NSArray *cookies =[NSHTTPCookie cookiesWithResponseHeaderFields:[response allHeaderFields] forURL:response.URL];
    for (NSHTTPCookie *cookie in cookies) {
        [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookie:cookie];
    }
    decisionHandler(WKNavigationResponsePolicyAllow);
}

- (void)cookiesShareSet{
    //取出cookie
    NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    //js函数
    NSString *JSFuncString =
    @"function setCookie(name,value,expires)\
    {\
    var oDate=new Date();\
    oDate.setDate(oDate.getDate()+expires);\
    document.cookie=name+'='+value+';expires='+oDate+';path=/'\
    }\
    function getCookie(name)\
    {\
    var arr = document.cookie.match(new RegExp('(^| )'+name+'=({FNXX==XXFN}*)(;|$)'));\
    if(arr != null) return unescape(arr[2]); return null;\
    }\
    function delCookie(name)\
    {\
    var exp = new Date();\
    exp.setTime(exp.getTime() - 1);\
    var cval=getCookie(name);\
    if(cval!=null) document.cookie= name + '='+cval+';expires='+exp.toGMTString();\
    }";
    
    //拼凑js字符串
    NSMutableString *JSCookieString = JSFuncString.mutableCopy;
    for (NSHTTPCookie *cookie in cookieStorage.cookies) {
        NSString *excuteJSString = [NSString stringWithFormat:@"setCookie('%@', '%@', 1);", cookie.name, cookie.value];
        [JSCookieString appendString:excuteJSString];
    }
    
    //NSLog(@"JSCookieString%@",JSCookieString);
    
    //执行js
    [self.webView evaluateJavaScript:JSCookieString completionHandler:^(id obj, NSError * _Nullable error) {
        //NSLog(@"%@",error);
    }];
}

-(void)saveCookieWithName:(NSString *)name value:(NSString *)value domain:(NSString *)domain{
    // 保存
    NSMutableDictionary *cookieProperties = [NSMutableDictionary dictionary];
    // 给cookie取名
    [cookieProperties setObject:name  forKey:NSHTTPCookieName];
    // 设置值
    [cookieProperties setObject:value forKey:NSHTTPCookieValue];
    // 存放目录 通常@"/"
    [cookieProperties setObject:@"/" forKey:NSHTTPCookiePath];
    // 设置本地过期时间 一年后
    // 不设置关掉App就会清空
    [cookieProperties setValue:[NSDate dateWithTimeIntervalSinceNow:3600*24*30*12] forKey:NSHTTPCookieExpires];
    // 设置域名
    [cookieProperties setObject:[NSURL URLWithString:domain].host forKey:NSHTTPCookieDomain];
    //[cookieProperties setObject:[NSURL URLWithString:domain].host forKey:NSHTTPCookieOriginURL];
    
    // 生成cookie
    NSHTTPCookie *httpCookie = [NSHTTPCookie cookieWithProperties:cookieProperties];
    // 存入仓库
    [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookie:httpCookie];
}

- (void)deleteCookieWithName:(NSString *)name {
    NSHTTPCookieStorage *cookieJar = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    for (NSHTTPCookie *cookie in [cookieJar cookies]) {
        //NSLog(@"deleteCookie%@", cookie);
        if ([cookie.name isEqualToString:name]) {
            [cookieJar deleteCookie:cookie];
        }
    }
}

- (NSHTTPCookie *)cookieWithName:(NSString *)name {
    NSHTTPCookieStorage *cookieJar = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    for (NSHTTPCookie *cookie in [cookieJar cookies]) {
        //NSLog(@"cookieWithName%@", cookie);
        if ([cookie.name isEqualToString:name]) {
            return cookie;
        }
    }
    return nil;
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
}

@end
