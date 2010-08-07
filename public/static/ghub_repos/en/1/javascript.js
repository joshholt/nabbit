(function(){var a="sproutcore/standard_theme";if(!SC.BUNDLE_INFO){throw"SC.BUNDLE_INFO is not defined!"
}if(SC.BUNDLE_INFO[a]){return}SC.BUNDLE_INFO[a]={requires:["sproutcore/empty_theme"],styles:["/static/sproutcore/standard_theme/en/1/stylesheet-packed.css","/static/sproutcore/standard_theme/en/1/stylesheet.css"],scripts:["/static/sproutcore/standard_theme/en/1/javascript-packed.js"]}
})();GhubRepos=SC.Application.create({NAMESPACE:"GhubRepos",VERSION:"0.0.1",store:SC.Store.create().from("GhubRepos.GithubDataSource"),displayRepoInfo:function(){SC.AlertPane.warn("You Clicke Me...","","OK","Cancel","")
}});GhubRepos.repoController=SC.ObjectController.create({contentBinding:"GhubRepos.reposController.selection"});
GhubRepos.reposController=SC.ArrayController.create({contentBinding:"GhubRepos.userController.repos"});
GhubRepos.userController=SC.ObjectController.create({contentBinding:"GhubRepos.usersController.selection"});
GhubRepos.usersController=SC.ArrayController.create({allowsEmptySelection:NO});GhubRepos.GithubDataSource=SC.DataSource.extend({fetch:function(a,c){var b=c.get("url");
if(b){SC.Request.getUrl(b).json().notify(GhubRepos.Handlers,"didFetchUser",a,c).send();
return YES}return NO},retrieveRecord:function(a,b){return NO},createRecord:function(a,b){return NO
},updateRecord:function(a,b){return NO},destroyRecord:function(a,b){return NO}});
GhubRepos.Handlers=SC.Object.create({didFetchUser:function(g,i,h){if(SC.ok(g)){var f=g.get("body")[0],c=f?f.name:null,b=f?f.totalWatchers:null,d=f?f.repositories:null,e={},a=[];
if(c&&d&&b){d.forEach(function(j){j.guid="@id%@".fmt(SC.Store.generateStoreKey());
a.push(j.guid)});e.name=c;e.totalWatchers=b;e.guid="@id%@".fmt(SC.Store.generateStoreKey());
e.repos=a;i.loadRecords(GhubRepos.User,[e]);i.loadRecords(GhubRepos.Repo,d);i.dataSourceDidFetchQuery(h)
}else{i.dataSourceDidErrorQuery(h,g)}}else{i.dataSourceDidErrorQuery(h,g)}}});GhubRepos.Repo=SC.Record.extend({name:SC.Record.attr(String),description:SC.Record.attr(String),forks:SC.Record.attr(Number),url:SC.Record.attr(String),hasDownloads:SC.Record.attr(Boolean),createdAt:SC.Record.attr(Date),homepage:SC.Record.attr(String),isFork:SC.Record.attr(Boolean),hasWiki:SC.Record.attr(Boolean),openIssues:SC.Record.attr(Number),isPrivate:SC.Record.attr(Boolean),hasIssues:SC.Record.attr(Boolean),pushedAt:SC.Record.attr(Date),hubber:SC.Record.toOne("GhubRepos.User",{isMaster:NO}),owner:SC.Record.attr(String)});
GhubRepos.User=SC.Record.extend({name:SC.Record.attr(String),repos:SC.Record.toMany("GhubRepos.Repo",{isMaster:YES}),totalWatchers:SC.Record.attr(Number)});
GhubRepos.mainPage=SC.Page.design({mainPane:SC.MainPane.design({defaultResponder:GhubRepos,childViews:"searchBar contentArea".w(),searchBar:SC.View.design({layout:{top:22,left:50,right:50,height:24},childViews:"searchTB searchBTN".w(),searchTB:SC.TextFieldView.design({layout:{top:0,width:120,height:22,left:0},hint:"Username...",valueBinding:"GhubRepos.searchUser"}),searchBTN:SC.ButtonView.design({layout:{top:0,width:100,height:24,left:126},title:"Fetch",isDefault:YES,keyEquivalent:"return",action:function(){var a=GhubRepos.get("searchUser");
if(!GhubRepos.users.findProperty("name",a)){GhubRepos.defaultQuery.set("url","/repos/%@".fmt(a));
GhubRepos.users.refresh()}}})}),contentArea:SC.View.design({layout:{top:50,left:50,bottom:50,right:50},childViews:"users repos".w(),users:SC.ScrollView.design({layout:{top:0,left:0,bottom:0,width:175},contentView:SC.ListView.design({contentBinding:"GhubRepos.usersController.arrangedObjects",selectionBinding:"GhubRepos.usersController.selection",contentValueKey:"name",contentUnreadCountKey:"totalWatchers",rowHeight:48})}),repos:SC.ScrollView.design({layout:{top:0,left:176,bottom:0,right:0},contentViewBinding:"GhubRepos.mainPage.repoScenes"})})}),repoScenes:SC.SceneView.design({scenes:["repoList","repoDetails"],nowShowing:"repoList",repoListLengthObserver:function(){var a=GhubRepos.getPath("reposController.length");
if(a>0){var c=GhubRepos.getPath("mainPage.mainPane.contentArea.repos").$()[0].offsetHeight;
var b=a*48>c-2?a*48:c-2;this.adjust("height",b)}}.observes("GhubRepos.reposController.length")}),repoList:SC.ListView.design({layout:{top:0,left:0,bottom:0,right:0},contentBinding:"GhubRepos.reposController.arrangedObjects",selectionBinding:"GhubRepos.reposController.selection",contentValueKey:"name",contentUnreadCountKey:"watchers",rowHeight:48,actOnSelect:YES,action:function(){var a=GhubRepos.getPath("mainPage.repoScenes");
var b=GhubRepos.getPath("mainPage.mainPane.contentArea.repos").$()[0].offsetHeight;
a.set("nowShowing","repoDetails");a.adjust("height",b-2)}}),repoDetails:SC.View.design({childViews:"topBar webView".w(),topBar:SC.View.design({layout:{top:0,left:0,right:0,height:48},childViews:"backButton".w(),backgroundColor:"#ddd",backButton:SC.ButtonView.design({layout:{centerY:0,width:100,height:24,left:4},title:"Back",action:function(){var b=GhubRepos.getPath("mainPage.repoScenes");
var a=GhubRepos.getPath("reposController.length");var d=GhubRepos.getPath("mainPage.mainPane.contentArea.repos").$()[0].offsetHeight;
var c=a*48>d-2?a*48:d-2;b.set("nowShowing","repoList");b.adjust("height",c)}})}),webView:SC.WebView.design({layout:{top:49},valueBinding:"GhubRepos.repoController.url"})})});
GhubRepos.main=function main(){GhubRepos.getPath("mainPage.mainPane").append();GhubRepos.defaultQuery=SC.Query.local("GhubRepos.User",{url:"/repos/joshholt"});
GhubRepos.users=GhubRepos.store.find(GhubRepos.defaultQuery);GhubRepos.usersController.set("content",GhubRepos.users)
};function main(){GhubRepos.main()};