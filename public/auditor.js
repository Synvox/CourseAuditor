/**
 * Course Auditing tool via JavaScript console
 * Ryan Allred
 * Include with <script>
 *   (import is not ready)
 */

var Auditor = {}

;(function(Auditor){
  'use strict'

  /**
   * Auditor.checkCourse (static method)
   * @param Number ordUnitId Course to audit
   * @callback Function callback (may be called multiple times as data comes)
   * @return Undefined
   */
  var checkCourse = Auditor.checkCourse = function(orgUnitId,callback) {
    $.ajax({
      url: 'https://byui.brightspace.com/d2l/api/le/1.5/'+orgUnitId+'/content/root/',
      type: 'GET',
      dataType: 'json'
    }).done(function(root){
      var topics = [],
          responded = 0,
          targetedrequests = 0,
          returned = []

      var finish = function(){
        audit(returned, function(errors){
          if (callback)
            callback(errors)
        })
      }

      var getTopic = function(id){
        $.ajax({
          url: 'https://byui.brightspace.com/d2l/api/le/1.5/'+orgUnitId+'/content/topics/'+id,
          type: 'GET',
          dataType: 'json'
        }).done(function(topic){
          console.info('total: '+returned.length,topic.Title)

          if (topic.Url.endsWith('.html')) {
            returned.push({
              title: topic.Title,
              url: topic.Url,
              orgUnitId: orgUnitId,
              id: topic.Id
            })
          }

          responded++
          if (responded === targetedrequests) {
            finish()
          }
        }).fail(function(e){
          responded++
          if (responded === targetedrequests) {
            finish()
          }
        })
      }

      var getModule = function(id){
        $.ajax({
          url: 'https://byui.brightspace.com/d2l/api/le/1.5/'+orgUnitId+'/content/modules/'+id,
          type: 'GET',
          dataType: 'json'
        }).done(function(module){
          if (module.Structure) {
            targetedrequests += module.Structure.length
            module.Structure.forEach(function(sub){
              var id = sub.Id,
                  istopic = (!!sub.Type)
              get(id, istopic)
            })

          }
        }).fail(function(){
          // silent
        })
      }

      var get = function(id, istopic){
        if (!istopic) {
          getModule(id)
          responded++ // Mark as responded so our count is correct
        } else {
          getTopic(id)
        }
      }

      root.forEach(function(module){
        targetedrequests += module.Structure.length
        module.Structure.forEach(function(topic){
          var topicId = topic.Id,
              istopic = (!!topic.Type)

          get(topicId, istopic)
        })
      })
    }).fail(function(){
      // silent
    })
  }

  var audit = function(pages,callback){
    var responded = 0,
        targetedrequests = pages.length,
        totalErrors = []

    pages.forEach(function(page){
      $.get(page.url,{},function(html){

        var errors = Tester.exec(page,html)

        if (errors) {
          console.warn(
            'Error(s) Found:',
            'https://byui.brightspace.com/d2l/le/content/'+page.orgUnitId+'/viewContent/'+page.id+'/View',
            'https://byui.brightspace.com' + escape(page.url),
             errors
           )
          totalErrors.push({
            title: page.title,
            brightspace: 'https://byui.brightspace.com/d2l/le/content/'+page.orgUnitId+'/viewContent/'+page.id+'/View',
            contentpage: 'https://byui.brightspace.com' + escape(page.url),
            errors: errors
          })
          callback(totalErrors) // concept: update as content is found
        }

        responded++
        if (responded === targetedrequests)
          callback(totalErrors)

      }).fail(function(){
        console.warn('%cNOT FOUND:','background: red; color: white',page.url)

        responded++
        if (responded === targetedrequests)
          callback(totalErrors)
      })
    })
  }

  var Tester = {
    tests: {},
    rawChecks: [],
    errors: {},

    exec: function(page,html){
      Tester.errors = {}

      Tester.rawChecks.forEach(function(fn){
        fn(page,html)
      })

      var dom = $(html)

      if (Tester.tests['*'])
        Tester.tests['*'](dom)

      var makeTest = function(query){
        return function(i,ele){
          Tester.tests[query].forEach(function(fn){
            fn($(ele))
          })
        }
      }

      for(var query in Tester.tests) {
        if (query === '*') continue
        dom.find(query).each(makeTest(query))
      }

      return Tester.errors;
    },

    mark: function(name,count){
      Tester.errors[name] = Tester.errors[name] || 0
      Tester.errors[name] += count
    },

    addRaw: function(name,fn){
      Tester.rawChecks.push(function(page,html) {
        var result = fn(page,html)
        if (result) {
          Tester.mark(name,Number(result))
        }
      })

      return Tester;
    },

    add: function(name, query, fn){
      Tester.tests[query] = Tester.tests[query] || []

      Tester.tests[query].push(function(input) {
        var result = fn(input)
        if (result) {
          Tester.mark(name,Number(result))
        }
      })

      return Tester
    }
  }

  Tester
    .add(undefined,'img',function(ele){
      // This is not a test. It changes images so they don't load 404 errors.

      ele.attr('data-src', ele.attr('src'))
      ele.removeAttr('src')

      return false
    })
    // return true on error found
    .add('IL2 Link','a',function(ele){
      return ele.attr('href') &&
             ele.attr('href').indexOf('brainhoney') >= 0
    })
    .add('Box Link','a',function(ele){
      return ele.attr('href') &&
             ele.attr('href').indexOf('box.com') >= 0
    })
    .add('Benjamin Link','a',function(ele){
      return ele.attr('href') &&
             ele.attr('href').indexOf('courses.byui.edu') >= 0
    })
    .add('Static IL3 Link','a',function(ele){
      return ele.attr('href') &&
            (ele.attr('href').indexOf('/calendar') >= 0 ||
             ele.attr('href').indexOf('/home') >= 0 ||
             ele.attr('href').indexOf('/viewContent') >= 0)
    })
    .add('Empty Links','a',function(ele){
      return !ele.attr('href') && !ele.attr('id')
    })
    .add('Empty Images','img',function(ele){
      return !ele.attr('data-src')
    })
    .add('IL2 Images','img',function(ele){
      return ele.attr('href') &&
             ele.attr('data-src').indexOf('brainhoney') >= 0
    })
    .add('Bad Image Widths','img',function(ele){
      if (!ele.attr('width'))
        return true

      return !ele.attr('width').endsWith('%')
    })
    .add('Image Alt Text','img',function(ele){
      return !ele.attr('alt')
    })
    .add('Spans','span',function(ele){
      return true
    })
    .add('Depricated Tags','b, i, br',function(ele){
      return true
    })
    .addRaw('Mentions of Saturdays',function(page, html){
      var arr = (html).match(/saturday/gi)
      return arr ? arr.length : false
    })
    .addRaw('IL2 Variables',function(page, html){
      var arr = (html).match(/\$[A-Za-z]+\S\$/g)
      return arr ? arr.length : false
    })
    .addRaw('HTML Title',function(page, html){
      var title = (/<title[^>]*>(.*?)<\/title>/g).exec(html)
      if (!title) return true
      else title = title[1]
      return title !== page.title
    })
})(Auditor)
