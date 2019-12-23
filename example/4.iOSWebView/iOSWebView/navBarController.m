//
//  navBarController.m
//  iOSWebView
//
//  Copyright © 2019 putaoshu. Licensed under the MIT license.
//

#import "navBarController.h"
#import <WebKit/WebKit.h>

@interface navBarController ()<WKNavigationDelegate, UIGestureRecognizerDelegate,WKUIDelegate, UINavigationControllerDelegate>

@property (nonatomic, strong)UIButton *cancleButton;
@property (nonatomic, readwrite) NSDictionary *dict;

@end

@implementation navBarController

- (void)viewDidLoad {
    [super viewDidLoad];

    [self webViewInit];
    [self extraTask];
    //[self extraTask2];
    //[self extraTask3];
    //[self extraTask...];
    
    _cancleButton = [UIButton buttonWithType:UIButtonTypeSystem];
    [_cancleButton setTitle:@"消息" forState:UIControlStateNormal];
    [_cancleButton setTitleColor:[UIColor blackColor] forState:UIControlStateNormal];
    [_cancleButton setEnabled:NO];
    //[_cancleButton addTarget:self action:@selector(cancleButtonClicked) forControlEvents:UIControlEventTouchUpInside];
    
    UIBarButtonItem *rightItem = [[UIBarButtonItem alloc]initWithCustomView:_cancleButton];
    self.navigationItem.rightBarButtonItem = rightItem;
    
    self.navigationController.delegate = self;
    self.navigationController.interactivePopGestureRecognizer.delegate = self;
}

-(void)extraTask{
    __weak typeof (self)weakSelf = self;

    NSURL *url = [NSURL URLWithString:@"https://api.myjson.com/bins/1cydek"];
    
    //请求对象
    NSURLRequest *request = [NSURLRequest requestWithURL:url];
    
    //会话对象
    NSURLSession *session=[NSURLSession sharedSession];
    
    NSURLSessionDataTask *dataTask=[session dataTaskWithRequest:request completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
        
        //解析数据
        weakSelf.dict = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableContainers error:nil];
        //NSLog(@"%@",weakSelf.dict);
        
        NSNumber *msg_number = [weakSelf.dict objectForKey:@"msg_number"];
        NSLog(@"%@",msg_number);
        
        dispatch_async(dispatch_get_main_queue(), ^{
            [weakSelf.cancleButton setTitle:[msg_number stringValue] forState:UIControlStateNormal];
        });
    }];
    
    //执行
    [dataTask resume];
}

- (void)webViewInit {
    WKWebView *webView = [[WKWebView alloc] initWithFrame:CGRectMake(0, 50, self.view.bounds.size.width, self.view.bounds.size.height)];
    webView.navigationDelegate = self;
    [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"https://m.baidu.com"]]];
    [self.view addSubview:webView];
    webView.scrollView.scrollEnabled = NO;
}

#pragma mark - 导航栏的代理
- (void)navigationController:(UINavigationController *)navigationController willShowViewController:(UIViewController *)viewController animated:(BOOL)animated {
    //    BOOL isPushSelfClass = [viewController isKindOfClass:[self class]];
    //    [self.navigationController setNavigationBarHidden:isPushSelfClass animated:animated];
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
    
    //[self extraTask];
    //[self extraTask2];
    //[self extraTask3];
    //[self extraTask...];
}
// 页面加载失败时调用
- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation {
    NSLog(@"页面加载失败");
}

@end
