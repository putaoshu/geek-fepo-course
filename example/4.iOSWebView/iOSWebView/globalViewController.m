//
//  globalViewController.m
//  iOSWebView
//
//  Copyright © 2019 putaoshu. Licensed under the MIT license.
//

#import "globalWebViewBase/HPKPageManager.h"
#import "globalWebViewBase/HPKWebView.h"

#import "globalViewController.h"
#import <WebKit/WebKit.h>

@interface SingleWebView : HPKWebView
@end
@implementation SingleWebView
@end

@interface globalViewController ()<WKNavigationDelegate>
@property (nonatomic, strong, readwrite) SingleWebView *webView;
@end

@implementation globalViewController

- (void)dealloc {
    [[HPKPageManager sharedInstance] enqueueWebView:self.webView];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    NSLog(@"viewDidLoad");
    
    [self.view addSubview:({
        _webView = [[HPKPageManager sharedInstance] dequeueWebViewWithClass:[SingleWebView class] webViewHolder:self];
        
        _webView.navigationDelegate = self;
        
        _webView.frame = CGRectMake(0, 50, self.view.frame.size.width, self.view.frame.size.height - CGRectGetMaxY(self.navigationController.navigationBar.frame));;
        
        [_webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"https://m.baidu.com"]]];
        _webView;
    })];
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
