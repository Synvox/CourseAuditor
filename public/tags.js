'use strict';

riot.tag2('app', '<div class="entry" each="{entry in this.audit}"> <h2>{entry.title}</h2> <a href="{entry.brightspace}" target="_blank">Brightspace</a> <a href="{entry.contentpage}" target="_blank">Content Page</a> <div class="errors"> <span class="error" each="{name, count in entry.errors}"><strong>{count}</strong> {name}</span> </div> </div>', 'app .entry:not(:first-child) { border-top: 1px solid #ccc; } app .entry .errors { border-radius: 3px; box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.1) inset; background: #f5ff6a; padding: 8px 20px; }', '', function (opts) {
  var _this = this;

  var courseId = Number(window.location.href.split('/')[5].split('-')[0]),
      errors = [];

  Auditor.checkCourse(courseId, function (audit) {
    _this.update({ audit: audit });
  });
}, '{ }');