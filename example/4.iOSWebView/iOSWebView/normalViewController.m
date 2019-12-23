//
//  normalViewController.m
//  iOSWebView
//
//  Copyright © 2019 putaoshu. Licensed under the MIT license.
//

#import "normalViewController.h"
#import <WebKit/WebKit.h>

@interface normalViewController ()<UIGestureRecognizerDelegate>

@end

@implementation normalViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];

    UIButton *btn1 = [UIButton buttonWithType:UIButtonTypeCustom];
    [btn1 setTitle:@"这是 普通原生页面" forState:UIControlStateNormal];
    [btn1 setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    btn1.frame = CGRectMake(50, 200, 250, 30);
    [self.view addSubview:btn1];

    self.navigationController.interactivePopGestureRecognizer.delegate = self;
}

@end
