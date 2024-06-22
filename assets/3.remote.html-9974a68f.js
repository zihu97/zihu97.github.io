import{_ as n,W as s,X as a,a1 as e}from"./framework-a4c02b8f.js";const i={},t=e(`<h1 id="远程仓库" tabindex="-1"><a class="header-anchor" href="#远程仓库" aria-hidden="true">#</a> 远程仓库</h1><p>之前的所有演示都基于本地仓库的，git同样也支持远程仓库，如果想要与他人进行协作开发，可以将项目保存在一个中央服务器上，每一个人将本地仓库的修改推送到远程仓库上，其他人拉取远程仓库的修改，这样一来就可以同步他人的修改。对于远程仓库而言，对于公司而言，都会有自己的内网代码托管服务器，对于个人开发者而言，可以选择自己搭建一个代码托管服务器，又或者是选择第三方托管商。如果你有精力折腾的话可以自己搭，不过我推荐选择第三方的托管商，这样可以将更多精力专注于项目开发上，而且能让更多人发现你的优秀项目。</p><figure><img src="https://public-1308755698.cos.ap-chongqing.myqcloud.com//img/202309111324350.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><h2 id="第三方托管" tabindex="-1"><a class="header-anchor" href="#第三方托管" aria-hidden="true">#</a> 第三方托管</h2><p>自建托管网站就是自己搭建的，第三方代码托管网站就是第三方搭建的，他们通过提供优质的代码托管服务，来吸引各式各样的开发人员与开源项目，时至今日，很多托管商基本上都不在局限于代码托管的功能。使用第三方托管商提供的平台，可以让开发者更专注于项目开发，而有些第三方托管商会将自己的项目开源，以供进行私有化部署，并为此提供配套的企业级服务。做的比较好的第三方托管商有以下几个</p><ul><li>Github</li><li>GitLab</li><li>BiteBucket</li><li>Gitee</li><li>sourceforge</li><li>Coding</li></ul><p>其中，GitHub是使用最普及的，可以说，干程序员这行就没有不知道GitHub的，本文将选择Github来作为远程仓库进行讲述。</p><h2 id="git代理" tabindex="-1"><a class="header-anchor" href="#git代理" aria-hidden="true">#</a> Git代理</h2><p>在本文开始讲解怎么进行远程仓库的操作之前，有一个相当重要的东西需要解决，那就是网络问题。在国内，Github是无法正常访问的，正常访问Github网站以及它提供的代码托管服务都会相当的缓慢，慢到只有几KB/s，在这种情况下，只能通过魔法上网来解决。</p><p>首先你需要自己付费购买代理服务，一般代理商都会给你提供相应的代理工具，比如我使用的代理工具是Clash for windows，它的本地代理端口是<code>7890</code>，并且同时支持http和socks5协议</p><img src="https://public-1308755698.cos.ap-chongqing.myqcloud.com//img/202309111928298.png" style="zoom:50%;"><p>在知晓了代理端口以后，就可以给Git bash 配置代理了</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token comment"># http</span>
$ <span class="token function">git</span> config <span class="token parameter variable">--gloabl</span> http.proxy http://127.0.0.1:7890
$ <span class="token function">git</span> config <span class="token parameter variable">--gloabl</span> https.proxy http://127.0.0.1:7890
<span class="token comment"># socks5</span>
$ <span class="token function">git</span> config <span class="token parameter variable">--global</span> http.proxy socks5://127.0.0.1:7890
$ <span class="token function">git</span> config <span class="token parameter variable">--global</span> https.proxy socks5://127.0.0.1:7890
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面的是全局设置，你可以只为特定的域名设置代理</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token function">git</span> config <span class="token parameter variable">--global</span> http.https://github.com.proxy http://127.0.0.1:7890
<span class="token function">git</span> config <span class="token parameter variable">--global</span> http.https://github.com.proxy socks5://127.0.0.1:7890
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>代理设置完毕后，再使用远程托管服务就会流畅许多。</p><h2 id="克隆仓库" tabindex="-1"><a class="header-anchor" href="#克隆仓库" aria-hidden="true">#</a> 克隆仓库</h2><p>在GitHub上有着成千上万的开源仓库，如果你想要获取一个开源仓库的源代码，最好的方式就是克隆仓库，比如Go这门编程语言的开源仓库，事实上这是镜像仓库，源仓库在谷歌。</p><figure><img src="https://public-1308755698.cos.ap-chongqing.myqcloud.com//img/202309111910320.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>通过Code按钮可以获取该仓库的url</p><img src="https://public-1308755698.cos.ap-chongqing.myqcloud.com//img/202309111911700.png" style="zoom:50%;"><p>然后在本地找一个你觉得合适的位置来放置该项目，随后执行命令</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> clone https://github.com/golang/go.git
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>Go源代码的大小有500MB左右，在将代码克隆到本地以后，你就可以开始独自研究，修改，并编译这些源代码了。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">ls</span>
CONTRIBUTING.md  PATENTS    SECURITY.md  codereview.cfg  go.env  misc/  test/
LICENSE          README.md  api/         doc/            lib/    src/
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>实际上<code>git clone</code>的url参数也可以是本地仓库，例如</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> clone /home/bob/project/git-learn/
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>git在将仓库克隆到本地时或者检出远程分支时，会自动创建跟踪分支，跟踪分支是与远程分支有着直接关系的本地分支，比如远程分支叫<code>origin/main</code>，那么本地的跟踪分支就与之同名叫<code>main</code>，先查看下分支情况</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> branch <span class="token parameter variable">--all</span>
* main
  remotes/origin/HEAD -<span class="token operator">&gt;</span> origin/main
  remotes/origin/main
  remotes/origin/op
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到这里有四个分支，首先<code>main</code>属于跟踪分支，<code>origin/main</code>属于远程跟踪分支，它是对于远程仓库中的分支的引用。我们后续在工作区的修改都是基于跟踪分支，远程跟踪分支是不可写的，git会在每一次fetch时更新远程跟踪分支。通过给<code>git branch</code>命令加上<code>-vv</code>参数，可以查看本地所有的跟踪分支。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> branch <span class="token parameter variable">-vv</span>
* main f5602b9 <span class="token punctuation">[</span>origin/main<span class="token punctuation">]</span> Revert <span class="token string">&quot;revert example&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到git只为main分支自动创建了跟踪分支。假设远程仓库初始状态如下</p><figure><img src="https://public-1308755698.cos.ap-chongqing.myqcloud.com//img/202309112135355.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>将代码克隆到本地后，本地仓库的状态如下图，在最开始时两个分支都指向的同一个提交。</p><figure><img src="https://public-1308755698.cos.ap-chongqing.myqcloud.com//img/202309112136917.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>当你在本地做了一些修改并提交，发现远程仓库上有新提交，并使用<code>git fetch</code>抓取了修改后，于是两个分支各自指向了不同的提交。</p><figure><img src="https://public-1308755698.cos.ap-chongqing.myqcloud.com//img/202309112139906.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>这时，为了同步修改，你需要将远程跟踪分支与本地跟踪分支使用<code>git merge</code>合并，于是两个分支又指向了同一个提交。</p><figure><img src="https://public-1308755698.cos.ap-chongqing.myqcloud.com//img/202309112141589.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>最终你将提交通过<code>git push</code>推送到了远程仓库，而此时远程仓库的状态就如下图。</p><figure><img src="https://public-1308755698.cos.ap-chongqing.myqcloud.com//img/202309112145929.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>这基本上就是一般远程仓库的工作流程。</p><h2 id="关联仓库" tabindex="-1"><a class="header-anchor" href="#关联仓库" aria-hidden="true">#</a> 关联仓库</h2><p>在本地已有仓库的情况下，可以通过<code>git remote</code>命令将其与远程仓库关联，已知远程仓库的URL为</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>https://github.com/246859/git-example.git
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>那么执行<code>git remote add &lt;name&gt; &lt;url&gt;</code>来将其关联</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> remote <span class="token function">add</span> github https://github.com/246859/git-example.git
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>通过<code>git remote -v</code>来查看本地仓库与之关联的远程仓库</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> remote <span class="token parameter variable">-v</span>
github  https://github.com/246859/git-example.git <span class="token punctuation">(</span>fetch<span class="token punctuation">)</span>
github  https://github.com/246859/git-example.git <span class="token punctuation">(</span>push<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>仓库关联成功以后通过<code>show</code>子命令来查看细节</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> remote show github
* remote github
  Fetch URL: https://github.com/246859/git-example.git
  Push  URL: https://github.com/246859/git-example.git
  HEAD branch: main
  Remote branches:
    main tracked
    noop tracked
    <span class="token function">op</span>   tracked
  Local refs configured <span class="token keyword">for</span> <span class="token string">&#39;git push&#39;</span><span class="token builtin class-name">:</span>
    main pushes to main <span class="token punctuation">(</span>up to <span class="token function">date</span><span class="token punctuation">)</span>
    <span class="token function">op</span>   pushes to <span class="token function">op</span>   <span class="token punctuation">(</span>up to <span class="token function">date</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果后续不再需要了可以删除掉</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> remote remove github
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>通过<code>git remote rename</code>来修改关联名称</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> remote <span class="token function">rename</span> github gitea
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>或者使用<code>git remote set-url</code>来更新url</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> remote set-url schema://host/repo
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>一个本地仓库也可以多同时关联多个仓库</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> remote <span class="token function">add</span> gitea https://gitea.com/246859/example.git

$ <span class="token function">git</span> remote <span class="token parameter variable">-v</span>
gitea   https://gitea.com/246859/example.git <span class="token punctuation">(</span>fetch<span class="token punctuation">)</span>
gitea   https://gitea.com/246859/example.git <span class="token punctuation">(</span>push<span class="token punctuation">)</span>
github  https://github.com/246859/git-example.git <span class="token punctuation">(</span>fetch<span class="token punctuation">)</span>
github  https://github.com/246859/git-example.git <span class="token punctuation">(</span>push<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>实际上gitea这个url并不存在，只是我随便编的，git在关联远程仓库时并不会去尝试抓取它，除非加上<code>-f</code>参数，因为url不存在，抓取的结果自然会失败。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> remote <span class="token function">add</span> <span class="token parameter variable">-f</span> gitea https://gitea.com/246859/example.git
Updating gitea
remote: Not found.
fatal: repository <span class="token string">&#39;https://gitea.com/246859/example.git/&#39;</span> not found
error: Could not fetch gitea
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="拉取修改" tabindex="-1"><a class="header-anchor" href="#拉取修改" aria-hidden="true">#</a> 拉取修改</h2><p>在本地仓库与远程仓库刚关联时，仓库内的代码多半是不一致的，为了同步，首先需要拉取远程仓库的修改。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> fetch github
remote: Enumerating objects: <span class="token number">28</span>, done.
remote: Counting objects: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">28</span>/28<span class="token punctuation">)</span>, done.
remote: Compressing objects: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">19</span>/19<span class="token punctuation">)</span>, done.
remote: Total <span class="token number">28</span> <span class="token punctuation">(</span>delta <span class="token number">6</span><span class="token punctuation">)</span>, reused <span class="token number">27</span> <span class="token punctuation">(</span>delta <span class="token number">5</span><span class="token punctuation">)</span>, pack-reused <span class="token number">0</span>
Unpacking objects: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">28</span>/28<span class="token punctuation">)</span>, <span class="token number">2.34</span> KiB <span class="token operator">|</span> <span class="token number">14.00</span> KiB/s, done.
From https://github.com/246859/git-example
 * <span class="token punctuation">[</span>new branch<span class="token punctuation">]</span>      main       -<span class="token operator">&gt;</span> github/main
 * <span class="token punctuation">[</span>new tag<span class="token punctuation">]</span>         v1.0.0     -<span class="token operator">&gt;</span> v1.0.0
 * <span class="token punctuation">[</span>new tag<span class="token punctuation">]</span>         v1.0.1     -<span class="token operator">&gt;</span> v1.0.1
 * <span class="token punctuation">[</span>new tag<span class="token punctuation">]</span>         v1.0.3     -<span class="token operator">&gt;</span> v1.0.3
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后查看本地分支就会发现多出来了一个分支<code>remotes/github/main</code></p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> branch <span class="token parameter variable">-a</span>
  conflict
  feature_V3
  feature_v2
  jkl
* main
  <span class="token function">op</span>
  <span class="token builtin class-name">test</span>
  v1
  v2
  remotes/github/main
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>该分支就是远程仓库上的分支，<code>git fetch</code>命令就是将远程仓库上的修改抓取到了本地的<code>remotes/github/main</code>分支上，但实际上我们的工作分支是<code>main</code>分支，所以我们需要改将其合并</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> merge github/main
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>如果想抓取所有远程分支的修改，可以带上<code>--all</code>参数。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> fetch <span class="token parameter variable">--all</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="hint-container tip"><p class="hint-container-title">提示</p><p>如果提示<code>fatal: refusing to merge unrelated histories </code>，可以加上<code>--allow-unrelated-histories</code>参数，之所以发生这个问题是因为两个仓库的历史不相关，是独立的。</p></div><h3 id="跟踪分支" tabindex="-1"><a class="header-anchor" href="#跟踪分支" aria-hidden="true">#</a> 跟踪分支</h3><p>在抓取修改后，git并不会创建跟踪分支，在这种情况下，需要手动创建一个分支，然后将指定的远程分支设置为其上游分支</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> checkout <span class="token parameter variable">-b</span> <span class="token operator">&lt;</span>branch<span class="token operator">&gt;</span>
$ <span class="token function">git</span> branch <span class="token parameter variable">-u</span> <span class="token operator">&lt;</span>remote<span class="token operator">&gt;</span>/<span class="token operator">&lt;</span>branch<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>或者使用更简洁但具有同样效果的命令</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> checkout <span class="token parameter variable">-b</span> <span class="token operator">&lt;</span>branchname<span class="token operator">&gt;</span> <span class="token operator">&lt;</span>remote<span class="token operator">&gt;</span>/<span class="token operator">&lt;</span>branch<span class="token operator">&gt;</span> 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>以及加上<code>--track</code>参数来自动创建同名的本地跟踪分支</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>$ git checkout --track &lt;remote&gt;/&lt;branch&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>或者你也可以只带分支名，当git发现有与之同名的远程分支就会自动跟踪</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> checkout <span class="token operator">&lt;</span>branch<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>当不再需要跟踪分支时，可以直接通过如下来撤销该分支的上游</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> branch --unset-upstream <span class="token operator">&lt;</span>branch<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="拉取合并" tabindex="-1"><a class="header-anchor" href="#拉取合并" aria-hidden="true">#</a> 拉取合并</h3><p>每一次抓取修改后都需要手动合并或许有点麻烦，为此git提供了<code>git pull</code>命令来一次性完成这个步骤。格式是如下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> pull <span class="token operator">&lt;</span>remote<span class="token operator">&gt;</span> <span class="token operator">&lt;</span>remote-branch<span class="token operator">&gt;</span>:<span class="token operator">&lt;</span>local-branch<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>如果要合并的本地分支就是当前分支，则可以省略冒号以及后面的参数，例如</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> pull github main
From https://github.com/246859/git-example
 * branch            main       -<span class="token operator">&gt;</span> FETCH_HEAD
Already up to date.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>同样的，它也支持<code> --allow-unrelated-histories</code>参数，以及所有<code>git fetch</code>支持的参数。</p><h2 id="推送修改" tabindex="-1"><a class="header-anchor" href="#推送修改" aria-hidden="true">#</a> 推送修改</h2><p>当你在本地完成了修改，并提交到了本地仓库时，如果想要将提交推送到远程仓库，就需要用到<code>git push</code>命令。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> push <span class="token operator">&lt;</span>remote<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>该命令执行时，默认会推送当前分支的提交，如果当前分支在远程仓库上并不存在，远程仓库就会自动创建该分支，git也在控制台中输出了整个创建的过程。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> push github
Total <span class="token number">0</span> <span class="token punctuation">(</span>delta <span class="token number">0</span><span class="token punctuation">)</span>, reused <span class="token number">0</span> <span class="token punctuation">(</span>delta <span class="token number">0</span><span class="token punctuation">)</span>, pack-reused <span class="token number">0</span>
remote:
remote: Create a pull request <span class="token keyword">for</span> <span class="token string">&#39;op&#39;</span> on GitHub by visiting:
remote:      https://github.com/246859/git-example/pull/new/op
remote:
To https://github.com/246859/git-example.git
 * <span class="token punctuation">[</span>new branch<span class="token punctuation">]</span>      <span class="token function">op</span> -<span class="token operator">&gt;</span> <span class="token function">op</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>或者你也可以推送指定分支以及指定远程分支的名称</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> push github op:noop
Total <span class="token number">0</span> <span class="token punctuation">(</span>delta <span class="token number">0</span><span class="token punctuation">)</span>, reused <span class="token number">0</span> <span class="token punctuation">(</span>delta <span class="token number">0</span><span class="token punctuation">)</span>, pack-reused <span class="token number">0</span>
remote:
remote: Create a pull request <span class="token keyword">for</span> <span class="token string">&#39;noop&#39;</span> on GitHub by visiting:
remote:      https://github.com/246859/git-example/pull/new/noop
remote:
To https://github.com/246859/git-example.git
 * <span class="token punctuation">[</span>new branch<span class="token punctuation">]</span>      <span class="token function">op</span> -<span class="token operator">&gt;</span> noop
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果想要删除远程分支，只需要加上一个<code>--delete</code>参数即可，例如</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> push github <span class="token parameter variable">--delete</span> noop
To https://github.com/246859/git-example.git
 - <span class="token punctuation">[</span>deleted<span class="token punctuation">]</span>         noop
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="ssh" tabindex="-1"><a class="header-anchor" href="#ssh" aria-hidden="true">#</a> SSH</h2><p>在与远程仓库进行交互的时候，默认使用的是HTTP方式，它的缺点很明显，就是每一次都要手动输入账号密码，为此，使用SSH协议来替代HTTP会更好。</p><figure><img src="https://public-1308755698.cos.ap-chongqing.myqcloud.com//img/202310060939481.png" alt="github支持ssh协议" tabindex="0" loading="lazy"><figcaption>github支持ssh协议</figcaption></figure><p>接下来要在本地创建ssh密钥对，打开gitbash，执行如下命令，过程中会要求输入一些信息，根据自己情况来定。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ ssh-keygen <span class="token parameter variable">-t</span> rsa <span class="token parameter variable">-b</span> <span class="token number">4096</span>
Generating public/private rsa key pair.
Enter <span class="token function">file</span> <span class="token keyword">in</span> <span class="token function">which</span> to save the key <span class="token punctuation">(</span>/c/Users/Stranger/.ssh/id_rsa<span class="token punctuation">)</span>:
/c/Users/Stranger/.ssh/id_rsa already exists.
Overwrite <span class="token punctuation">(</span>y/n<span class="token punctuation">)</span>? y
Enter passphrase <span class="token punctuation">(</span>empty <span class="token keyword">for</span> no passphrase<span class="token punctuation">)</span>:
Enter same passphrase again:
Your identification has been saved <span class="token keyword">in</span> /c/Users/Stranger/.ssh/id_rsa
Your public key has been saved <span class="token keyword">in</span> /c/Users/Stranger/.ssh/id_rsa.pub
The key fingerprint is:
SHA256:bbkk3VPOsowFTn9FQYeDl1aP3Ib+BpdC1x9vaAsFOQA Stranger@LAPTOP-9VDMJGFL
The key&#39;s randomart image is:
+---<span class="token punctuation">[</span>RSA <span class="token number">4096</span><span class="token punctuation">]</span>----+
<span class="token operator">|</span>        E<span class="token punctuation">..</span><span class="token punctuation">..</span>o.*<span class="token operator">=</span><span class="token operator">|</span>
<span class="token operator">|</span>            +o*<span class="token operator">=</span>+<span class="token operator">|</span>
<span class="token operator">|</span>          o  <span class="token operator">=</span>*+*<span class="token operator">|</span>
<span class="token operator">|</span>         <span class="token operator">=</span> <span class="token operator">=</span>.*.<span class="token operator">+=</span><span class="token operator">|</span>
<span class="token operator">|</span>        S B B.O.<span class="token operator">=</span><span class="token operator">|</span>
<span class="token operator">|</span>         + <span class="token operator">=</span> B.* <span class="token operator">|</span>
<span class="token operator">|</span>          o o <span class="token builtin class-name">.</span> o<span class="token operator">|</span>
<span class="token operator">|</span>               <span class="token builtin class-name">.</span> <span class="token operator">|</span>
<span class="token operator">|</span>                 <span class="token operator">|</span>
+----<span class="token punctuation">[</span>SHA256<span class="token punctuation">]</span>-----+
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>默认情况下，它会生成在<code>~/.ssh/</code>目录下，git也是默认从这里去读取你的密钥文件。<code>id.rsa</code>是私钥文件，不可以泄露，否则这个密钥对就没有安全意义了。<code>id.rsa.pub</code>是公钥文件，这是需要向外部暴露的。来到github的setting中，添加新的SSH Keys。</p><figure><img src="https://public-1308755698.cos.ap-chongqing.myqcloud.com//img/202310060950740.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>将公钥文件的内容复制到输入框中，再点击按钮添加公钥。完事后执行如下命令测试下</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">ssh</span> <span class="token parameter variable">-T</span> git@github.com
Hi <span class="token number">246859</span><span class="token operator">!</span> You&#39;ve successfully authenticated, but GitHub does not provide shell access.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到成功通过SSH认证了，再通过SSH方式克隆一个远程仓库试一试。</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>$ <span class="token function">git</span> clone git@github.com:246859/git-example.git
Cloning into <span class="token string">&#39;git-example&#39;</span><span class="token punctuation">..</span>.
remote: Enumerating objects: <span class="token number">28</span>, done.
remote: Counting objects: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">28</span>/28<span class="token punctuation">)</span>, done.
remote: Compressing objects: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">19</span>/19<span class="token punctuation">)</span>, done.
remote: Total <span class="token number">28</span> <span class="token punctuation">(</span>delta <span class="token number">6</span><span class="token punctuation">)</span>, reused <span class="token number">27</span> <span class="token punctuation">(</span>delta <span class="token number">5</span><span class="token punctuation">)</span>, pack-reused <span class="token number">0</span>
Receiving objects: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">28</span>/28<span class="token punctuation">)</span>, done.
Resolving deltas: <span class="token number">100</span>% <span class="token punctuation">(</span><span class="token number">6</span>/6<span class="token punctuation">)</span>, done.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到成功了，在github密钥管理界面，也能看到密钥的使用情况。</p><figure><img src="https://public-1308755698.cos.ap-chongqing.myqcloud.com//img/202310061002875.png" alt="" tabindex="0" loading="lazy"><figcaption></figcaption></figure><p>如此便配置好了通过SSH方式使用git。</p>`,111),p=[t];function o(c,l){return s(),a("div",null,p)}const d=n(i,[["render",o],["__file","3.remote.html.vue"]]);export{d as default};