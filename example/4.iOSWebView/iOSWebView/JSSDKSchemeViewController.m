//
//  JSSDKSchemeViewController.m
//  iOSWebView
//
//  Copyright © 2019 putaoshu. Licensed under the MIT license.
//

#import "JSSDKSchemeViewController.h"
#import <WebKit/WebKit.h>

@interface JSSDKSchemeViewController ()<WKNavigationDelegate, UIGestureRecognizerDelegate,WKUIDelegate, UINavigationControllerDelegate>
@end

@implementation JSSDKSchemeViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self webViewInit];
}

- (void)webViewInit {
    WKWebView *webView = [[WKWebView alloc] initWithFrame:CGRectMake(0, 50, self.view.bounds.size.width, self.view.bounds.size.height)];
    webView.navigationDelegate = self;
    [self loadExamplePage:webView];
    //[webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"https://m.baidu.com"]]];
    [self.view addSubview:webView];
    webView.scrollView.scrollEnabled = NO;
}

// URL Scheme
- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler {
   
    //获取跳转类型，如新链接、后退等
    NSURL *URL = navigationAction.request.URL;
    //检测URL是不是 自定义的URL Scheme
    if ([URL.scheme isEqualToString:@"myjssdk"]) {
        //根据不同的业务，来执行对应的操作，且获取参数
        if ([URL.host isEqualToString:@"login"]) {
            NSString *param = URL.query;
            NSLog(@"JSSDK - 登录, 参数为%@", param);
            decisionHandler(WKNavigationActionPolicyCancel);
            return;
        }
    }
    decisionHandler(WKNavigationActionPolicyAllow);
    //NSLog(@"%@", NSStringFromSelector(_cmd));
}

#pragma mark - 加载状态的回调
// 页面开始加载时调用
- (void)webView:(WKWebView *)webView didStartProvisionalNavigation:(WKNavigation *)navigation {
    NSLog(@"页面开始加载");
}
// 当内容开始返回时调用
- (void)webView:(WKWebView *)webView didCommitNavigation:(WKNavigation *)navigation {
    NSLog(@"数据开始返回");
}

// 页面加载完成之后调用
- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    NSLog(@"页面已经加载完成");
}
// 页面加载失败时调用
- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation {
    NSLog(@"页面加载失败");
}

- (void)loadExamplePage:(WKWebView*)webView {
    NSString* htmlPath = [[NSBundle mainBundle] pathForResource:@"JSSDKScheme" ofType:@"html"];
    NSString* appHtml = [NSString stringWithContentsOfFile:htmlPath encoding:NSUTF8StringEncoding error:nil];
    NSURL *baseURL = [NSURL fileURLWithPath:htmlPath];
    [webView loadHTMLString:appHtml baseURL:baseURL];
}

@end


