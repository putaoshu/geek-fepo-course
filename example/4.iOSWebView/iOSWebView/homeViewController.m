//
//  homeViewController.m
//  iOSWebView
//
//  Copyright © 2019 putaoshu. Licensed under the MIT license.
//

#import "homeViewController.h"
#import "normalViewController.h"
#import "UIWebViewController.h"
#import "normalWebViewViewController.h"
#import "globalViewController.h"
#import "navBarController.h"
#import "loginViewController.h"
#import "progressViewController.h"
#import "myProgressViewController.h"
#import "JSSDKIframeViewController.h"
#import "JSSDKWebKitViewController.h"
#import "JSSDKSchemeViewController.h"

#import <WebKit/WebKit.h>

@interface homeViewController ()

@end

@implementation homeViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    [self navigationBarSettings];
    [self nextView];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [UIApplication sharedApplication].statusBarStyle = UIStatusBarStyleDefault;
}

- (void)navigationBarSettings {
    self.title = @"Home";
    
    //[self.navigationController.navigationBar setTitleTextAttributes:@{NSFontAttributeName:[UIFont systemFontOfSize:17],NSForegroundColorAttributeName:[UIColor whiteColor]}];
    //[self.navigationController.navigationBar setBarTintColor:[UIColor colorWithRed:255 / 255.0 green:170  / 255.0 blue:251  / 255.0 alpha:1.0]];
    
    // 按钮颜色
    self.navigationController.navigationBar.tintColor = [UIColor blackColor];
}


- (void)nextView {
    
    UIButton *btn = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn setTitle:@"普通原生页面" forState:UIControlStateNormal];
    [btn setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
    btn.frame = CGRectMake(50, 100, 250, 30);
    [self.view addSubview:btn];
    
    UIButton *btn1 = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn1 setTitle:@"普通UIWebview" forState:UIControlStateNormal];
    [btn1 setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
    btn1.frame = CGRectMake(50, 150, 250, 30);
    [self.view addSubview:btn1];
    
    UIButton *btn2 = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn2 setTitle:@"普通WKWebview" forState:UIControlStateNormal];
    [btn2 setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
    btn2.frame = CGRectMake(50, 200, 250, 30);
    [self.view addSubview:btn2];
    
    UIButton *btn3 = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn3 setTitle:@"全局Webview" forState:UIControlStateNormal];
    [btn3 setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
    btn3.frame = CGRectMake(50, 250, 250, 30);
    [self.view addSubview:btn3];
    
    UIButton *btn4 = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn4 setTitle:@"导航栏Webview" forState:UIControlStateNormal];
    [btn4 setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
    btn4.frame = CGRectMake(50, 300, 250, 30);
    [self.view addSubview:btn4];
    
    UIButton *btn5 = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn5 setTitle:@"登录态Webview" forState:UIControlStateNormal];
    [btn5 setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
    btn5.frame = CGRectMake(50, 350, 250, 30);
    [self.view addSubview:btn5];
    
    UIButton *btn6 = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn6 setTitle:@"原生滚动条Webview" forState:UIControlStateNormal];
    [btn6 setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
    btn6.frame = CGRectMake(50, 400, 250, 30);
    [self.view addSubview:btn6];
    
    UIButton *btn7 = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn7 setTitle:@"自定义滚动条Webview" forState:UIControlStateNormal];
    [btn7 setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
    btn7.frame = CGRectMake(50, 450, 250, 30);
    [self.view addSubview:btn7];
    
    UIButton *btn8 = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn8 setTitle:@"JSSDK Scheme Webview" forState:UIControlStateNormal];
    [btn8 setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
    btn8.frame = CGRectMake(50, 500, 250, 30);
    [self.view addSubview:btn8];
    
    UIButton *btn9 = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn9 setTitle:@"JSSDK iframe Webview" forState:UIControlStateNormal];
    [btn9 setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
    btn9.frame = CGRectMake(50, 550, 250, 30);
    [self.view addSubview:btn9];
    
    UIButton *btn10 = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn10 setTitle:@"JSSDK WebKit Webview" forState:UIControlStateNormal];
    [btn10 setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
    btn10.frame = CGRectMake(50, 600, 250, 30);
    [self.view addSubview:btn10];
    
    [btn addTarget:self action:@selector(click:) forControlEvents:UIControlEventTouchUpInside];
    [btn1 addTarget:self action:@selector(click1:) forControlEvents:UIControlEventTouchUpInside];
    [btn2 addTarget:self action:@selector(click2:) forControlEvents:UIControlEventTouchUpInside];
    [btn3 addTarget:self action:@selector(click3:) forControlEvents:UIControlEventTouchUpInside];
    [btn4 addTarget:self action:@selector(click4:) forControlEvents:UIControlEventTouchUpInside];
    [btn5 addTarget:self action:@selector(click5:) forControlEvents:UIControlEventTouchUpInside];
    [btn6 addTarget:self action:@selector(click6:) forControlEvents:UIControlEventTouchUpInside];
    [btn7 addTarget:self action:@selector(click7:) forControlEvents:UIControlEventTouchUpInside];
    [btn8 addTarget:self action:@selector(click8:) forControlEvents:UIControlEventTouchUpInside];
    [btn9 addTarget:self action:@selector(click9:) forControlEvents:UIControlEventTouchUpInside];
    [btn10 addTarget:self action:@selector(click10:) forControlEvents:UIControlEventTouchUpInside];
}


- (void)click:(UIButton *)btn {
    NSLog(@"::normalViewController::");
    normalViewController *vc = [[normalViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
}

- (void)click1:(UIButton *)btn {
    NSLog(@"::UIWebViewController::");
    UIWebViewController *vc1 = [[UIWebViewController alloc] init];
    [self.navigationController pushViewController:vc1 animated:YES];
}

- (void)click2:(UIButton *)btn {
    NSLog(@"::normalWebViewViewController::");
    normalWebViewViewController *vc2 = [[normalWebViewViewController alloc] init];
    [self.navigationController pushViewController:vc2 animated:YES];
}

- (void)click3:(UIButton *)btn {
    NSLog(@"::globalViewController::");
    globalViewController *vc3 = [[globalViewController alloc] init];
    [self.navigationController pushViewController:vc3 animated:YES];
}

- (void)click4:(UIButton *)btn {
    NSLog(@"::navBarController::");
    navBarController *vc4 = [[navBarController alloc] init];
    [self.navigationController pushViewController:vc4 animated:YES];
}

- (void)click5:(UIButton *)btn {
    NSLog(@"::loginViewController::");
    loginViewController *vc5 = [[loginViewController alloc] init];
    [self.navigationController pushViewController:vc5 animated:YES];
}

- (void)click6:(UIButton *)btn {
    NSLog(@"::progressViewController::");
    progressViewController *vc6 = [[progressViewController alloc] init];
    [self.navigationController pushViewController:vc6 animated:YES];
}


- (void)click7:(UIButton *)btn {
    NSLog(@"::myProgressViewController::");
    myProgressViewController *vc7 = [[myProgressViewController alloc] init];
    [self.navigationController pushViewController:vc7 animated:YES];
}

- (void)click8:(UIButton *)btn {
    NSLog(@"::JSSDKSchemeViewController::");
    JSSDKSchemeViewController *vc8 = [[JSSDKSchemeViewController alloc] init];
    [self.navigationController pushViewController:vc8 animated:YES];
}

- (void)click9:(UIButton *)btn {
    NSLog(@"::JSSDKIframeViewController::");
    JSSDKIframeViewController *vc9 = [[JSSDKIframeViewController alloc] init];
    [self.navigationController pushViewController:vc9 animated:YES];
}

- (void)click10:(UIButton *)btn {
    NSLog(@"::JSSDKNativeViewController::");
    JSSDKWebKitViewController *vc10 = [[JSSDKWebKitViewController alloc] init];
    [self.navigationController pushViewController:vc10 animated:YES];
}

@end
