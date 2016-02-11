'use strict';

riot.tag2('app', '<form onsubmit="{search}"> <input type="text" name="input" value="{courseId}"> <button name="button">Submit</button> </form> <div if="{this.audit}" class="scoreboard"> <h1>Score: {this.analysis.points}</h1> <table> <thead> <tr> <th>Total Pages</th> <th>Broken Links</th> <th>Saturdays</th> </tr> </thead> <tbody> <tr> <td>{this.analysis.totalPages}</td> <td>{this.analysis.brokenLinks}</td> <td>{this.analysis.saturdays}</td> </tr> </tbody> </table> </div> <entry each="{entry in this.audit}" data="{entry}"></entry>', '[riot-tag="app"] { background: white; } [riot-tag="app"] .scoreboard { text-align: center; margin-bottom: 20px; } [riot-tag="app"] .scoreboard h1, [riot-tag="app"] .scoreboard table { margin: auto; } [riot-tag="app"] .scoreboard h1 { font-size: 40px; } [riot-tag="app"] .scoreboard th { padding: 0px 20px; }', '', function (opts) {
  var _this = this;

  this.courseId = Number(window.location.href.split('/')[5].split('-')[0]);
  this.audit = null;
  this.analysis = null;

  this.search = function () {
    _this.button.innerHTML = "Loading...";
    Auditor.checkCourse(_this.input.value, function (audit, analysis) {
      _this.update({ audit: audit, analysis: analysis });
      _this.button.innerHTML = "Submit";
    });
  };
}, '{ }');
'use strict';

riot.tag2('entry', '<div class="title">{entry.title}</div> <div class="meta"> <a href="{entry.brightspace}" target="_blank">View in Brightspace</a> <a href="{entry.contentpage}" target="_blank">Goto Content Page</a> <div class="errors"> <span class="error" each="{name, obj in entry.errors}"><strong>{obj.count}</strong> {name}</span> </div> </div>', 'entry { display: block; padding: 8px 20px; background: white; } entry:hover:not(.open) { background: rgba(0, 0, 0, 0.01); } entry .title { margin-bottom: 10px; font-weight: normal; font-size: 1rem; padding: 0px 4px; } entry .meta { display: none; } entry.open { box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1); border: 1px solid #ccc; } entry.open .meta { display: block; } entry .errors { border-radius: 3px; box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.1) inset; background: #f5ff6a; padding: 8px 20px; margin-top: 10px; } entry .errors .error { display: inline-block; padding: 0px 20px; }', 'onclick="{open}"', function (opts) {
  var _this = this;

  this.entry = this.opts.data;

  this.open = function (e) {
    if ($(e.target).attr('href')) return true;else $(_this.root).toggleClass('open');
  };
}, '{ }');