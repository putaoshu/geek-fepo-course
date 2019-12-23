//
//  myProgressViewController.m
//  iOSWebView
//
//  Copyright © 2019 putaoshu. Licensed under the MIT license.
//

#import "myProgressViewController.h"
#import <WebKit/WebKit.h>
//static const CGFloat duration = 1.0;

@interface myProgressViewController ()<WKNavigationDelegate, UIGestureRecognizerDelegate,WKUIDelegate, UINavigationControllerDelegate>

@property (nonatomic, strong)UIView *initialAnimateView;
@property (nonatomic, strong)UIView *finishAnimateView;

@end

@implementation myProgressViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self webViewInit];
    self.navigationController.delegate = self;
    //self.navigationController.interactivePopGestureRecognizer.delegate = self;    
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
    
    [_initialAnimateView removeFromSuperview];
    [_finishAnimateView removeFromSuperview];
    
    UIView *createInitialAnimateView = [[UIView alloc] initWithFrame:CGRectMake(0, 64, 0, 2)];
    createInitialAnimateView.backgroundColor = [UIColor blueColor];
    self.initialAnimateView = createInitialAnimateView;
    [self.view addSubview:self.initialAnimateView];
    
    // 0 ~ 60%
    [UIView animateWithDuration:1.0 delay:0.0 options:UIViewAnimationOptionCurveEaseIn | UIViewAnimationOptionAllowUserInteraction animations:^{
        self.initialAnimateView.frame = CGRectMake(0, 64, [[UIScreen mainScreen] bounds].size.width*0.6, 2);
    } completion:^(BOOL finished) {
        // 60% ~ 80%
        [UIView animateWithDuration:1.0 delay:0.0 options:UIViewAnimationOptionCurveLinear | UIViewAnimationOptionAllowUserInteraction animations:^{
            self.initialAnimateView.frame = CGRectMake(0, 64, [[UIScreen mainScreen] bounds].size.width*0.8, 2);
        } completion:^(BOOL finished) {
             // 80% ~ 90%
            [UIView animateWithDuration:1.0 delay:0.0 options:UIViewAnimationOptionCurveLinear | UIViewAnimationOptionAllowUserInteraction animations:^{
                self.initialAnimateView.frame = CGRectMake(0, 64, [[UIScreen mainScreen] bounds].size.width*0.9, 2);
            } completion:^(BOOL finished) {
                
            }];
        }];
    }];
}
// 当内容开始返回时调用
- (void)webView:(WKWebView *)webView didCommitNavigation:(WKNavigation *)navigation {
    NSLog(@"数据开始返回");
}

// 页面加载完成之后调用
- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation {
    NSLog(@"页面已经加载完成");
    
    if (_initialAnimateView) {
        [_initialAnimateView removeFromSuperview];
    }
    
    //90% ~ 100%
    UIView *createFinishAnimateView = [[UIView alloc] initWithFrame:CGRectMake(0, 64, [[UIScreen mainScreen] bounds].size.width*0.9, 2)];
    createFinishAnimateView.backgroundColor = [UIColor blueColor];
    self.finishAnimateView = createFinishAnimateView;
    [self.view addSubview:self.finishAnimateView];

    [UIView animateWithDuration:1.0 delay:0.0 options:UIViewAnimationOptionCurveEaseOut | UIViewAnimationOptionAllowUserInteraction animations:^{
        self.finishAnimateView.alpha = 0;
        self.finishAnimateView.frame = CGRectMake(0, 64, [[UIScreen mainScreen] bounds].size.width*1.0, 2);
    } completion:^(BOOL finished) {

    }];
}
// 页面加载失败时调用
- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation {
    NSLog(@"页面加载失败");
}

@end

