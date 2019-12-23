//
//  UIWebViewController.m
//  iOSWebView
//
//  Copyright © 2019 putaoshu. Licensed under the MIT license.
//

#import "UIWebViewController.h"

@interface UIWebViewController () <UIWebViewDelegate>
@property (nonatomic, strong, readwrite) UIWebView *webView;

@end

@implementation UIWebViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.webView = [[UIWebView alloc] init];
    self.webView.frame = self.view.frame;
    [self.view addSubview:self.webView];
    self.webView.delegate = self;
    
    [self.webView loadRequest: [[NSURLRequest alloc] initWithURL: [NSURL URLWithString: @"https://m.baidu.com"]]];
}

- (void)webViewDidStartLoad:(UIWebView *)webView{
    NSLog(@"webViewDidStartLoad");
}

- (void)webViewDidFinishLoad:(UIWebView *)webView{
    NSLog(@"webViewDidFinishLoad");
}


@end
