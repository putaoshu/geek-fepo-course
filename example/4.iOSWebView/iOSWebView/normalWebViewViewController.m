//
//  normalWebViewViewController.m
//  iOSWebView
//
//  Copyright © 2019 putaoshu. Licensed under the MIT license.
//

#import "normalWebViewViewController.h"
#import <WebKit/WebKit.h>

@interface normalWebViewViewController ()<WKNavigationDelegate, UIGestureRecognizerDelegate,WKUIDelegate, UINavigationControllerDelegate>
@end

@implementation normalWebViewViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self webViewInit];
    
    self.navigationController.delegate = self;
}

- (void)webViewInit {
    WKWebView *webView = [[WKWebView alloc] initWithFrame:CGRectMake(0, 50, self.view.bounds.size.width, self.view.bounds.size.height)];
    webView.navigationDelegate = self;
    [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"https://m.baidu.com"]]];
    [self.view addSubview:webView];
    webView.scrollView.scrollEnabled = NO;
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

@end
