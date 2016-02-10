'use strict';

riot.tag2('app', '<div each="{entry in this.audit}"> <h2>{entry.title}</h2> <a href="{entry.brightspace}" target="_blank">Brightspace</a> <a href="{entry.contentpage}" target="_blank">Content Page</a> <ul> <li each="{name, count in entry.errors}"><strong>{count}</strong> {name}</li> </ul> </div>', '', '', function (opts) {
  var _this = this;

  var courseId = Number(window.location.href.split('/')[5].split('-')[0]),
      errors = [];

  Auditor.checkCourse(courseId, function (audit) {
    _this.update({ audit: audit });
  });
}, '{ }');