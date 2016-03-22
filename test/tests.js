var test = require('unit.js'),
    should = require('should'),
    assert = require('assert'),
    request = require('supertest');

const app = require('../app/app');


/**
 * Test the application configuration.
 */
describe('config/app.js', function()
{
    var config = app.getConfig();

    it('is an object', function(){
        test.object(config);
    });
    it('has valid port', function(){
        test.number(app.config('port'))
            .isBetween(1,9000);
    });
    it('has controllers', function(){
        test.array(app.config('controllers'));
    });
    it('has models', function(){
        test.array(app.config('models'));
    });
    it('has correct env', function(){
        test.string(app.config('env'))
            .match((it)=> {
                return it==="local" || it==="development" || it==="production";
            })
    })
});

/**
 * Test the application core.
 */
describe('app/app.js', function()
{
    it('bootstraps', function(){
        test.object(app);
        test.undefined(app.Model);
        app.bootstrap();
        test.function(app.Model);
    })
});


describe('app/template.js', function()
{
    var Template = require('../app/template');

    var template = Template.create('New title');

    it('is constructor and instance', function(){
        test.function(Template).hasName('Template');
        test.object(template).isInstanceOf(Template);
    });
    it('constructor sets title', function(){
        test.string(template.title).is('New title');
    });
    it('generates head string', function(){
        test.string(template.head()).isNotEmpty();
    })
});



describe('app/controller.js', function()
{
    var Controller = require('../app/controller');

    var methods = {
        construct: function(controller){
            controller.bind('id', function(value,params){
                return "new-"+value;
            })
        },
        index: function(request,template,params) {

        }
    };

    var instance = Controller.create('testController', methods);

    it('is constructor', function(){
        test.function(Controller).hasName('ControllerFactory');
    });
    it('is instance', function(){
        test.object(instance).isInstanceOf(Controller);
        test.object(Controller.find('testController')).isIdenticalTo(instance);
        test.value(Controller.find('NotThereController')).is(null);
    });
    it('removes construct method', function(){
        test.bool(instance.has('construct')).isFalse();
        test.function(instance.use('construct')).hasName('errorMethod');
    });
    it('binds parameters', function(){
        test.object(instance._bindings);
        test.function(instance._bindings['id']);
    });
    it('attaches methods', function(){
        test.bool(instance.has('index')).isTrue();
        test.function(methods.index).isIdenticalTo(instance.use('index'));
    })
});

describe('REST', function(){
    var url = "http://localhost:8081/api/v1/";

    var itemId;

    it('GET fetchAll returns objects', function(done){
        request(url).get("media").send().end(function(err,res) {
            if (err) throw err;
            should(res).have.property('status',200);
            should(res).have.property('type','application/json');
            test.array(res.body.data);

            itemId = res.body.data[0]._id;
            done();
        });
    });

    it('GET fetchOne returns object', function(done){
        request(url).get("media/"+itemId).send().end(function(err,res) {
            if (err) throw err;
            should(res).have.property('status',200);
            should(res).have.property('type','application/json');
            test.object(res.body.data);
            test.string(res.body.data._id).isIdenticalTo(itemId);
            done();
        });
    });

    it('GET returns not found', function(done){
        request(url).get("notThere").send().end(function(err,res) {
            if (err) throw err;
            should(res).have.property('status',404);
            should(res).have.property('type','application/json');
            done();
        });
    });

    var media = {
        file_name:"test.jpg",
        file_type:"image/jpg",
        title: "testing"
    };

    var credentials = {
        username: "mike@bom.us",
        password: "pwd!118"
    };

    // Production only.
    if (app.config('env') === "production") {

        it('POST returns forbidden in production (csrf)', function(done){

            // Attempt to create.
            request(url)
                .post("media")
                .set('X-REQUESTED-WITH','XMLHttpRequest')
                .send(media)
                .end(function(err,res) {
                    if (err) throw err;
                    should(res).have.property('status',403);
                    should(res).have.property('type','application/json');
                    done();
                });
        });
    }

    // Test creating stuff.
    if (app.config('env') !== "production") {

        it('Logs user in', function(done) {

            request('http://localhost:8081').post('/login')
                .send(credentials)
                .end(function(err,res) {
                    should(res).have.property('status',302);
                    done();
                })
        });

        it ('POST creates objects', function(done) {

            request(url)
                .post("media")
                .set('X-REQUESTED-WITH','XMLHttpRequest')
                .send(media)
                .end(function(err,res) {
                    if (err) throw err;
                    should(res).have.property('status',200);
                    should(res).have.property('type','application/json');
                    test.object(res.body.data);
                    should(res.body.data).have.property('title','testing');

                    // For updating
                    media._id = res.body.data._id;

                    done();
                });
        });

        it ('PUT updates objects', function(done) {
            media.title = "CHANGED";
            request(url)
                .put('media/'+media._id)
                .set('X-REQUESTED-WITH','XMLHttpRequest')
                .send(media)
                .end(function(err,res) {
                    if (err) throw err;
                    should(res).have.property('status',200);
                    should(res).have.property('type','application/json');
                    var data = res.body.data;
                    test.object(data);
                    test.string(data._id).isIdenticalTo(media._id);
                    test.string(data.title).isIdenticalTo("CHANGED");

                    done();
                });
        });

        it ('DELETE deletes objects', function(done) {

            request(url)
                .delete('media/'+media._id)
                .set('X-REQUESTED-WITH','XMLHttpRequest')
                .send()
                .end(function(err,res) {
                    if (err) throw err;
                    should(res).have.property('status',200);
                    should(res).have.property('type','application/json');
                    should(res.body).have.property('method','DELETE');
                    var data = res.body.data;
                    test.object(data);
                    test.object(data.results);
                    test.string(data.objectId).isIdenticalTo(media._id);
                    test.number(data.results.ok).isIdenticalTo(1);
                    test.number(data.results.n).isIdenticalTo(1);

                    done();
                });

        });

        it('Logs user out', function(done) {

            request('http://localhost:8081').get('/logout')
                .send()
                .end(function(err,res) {
                    should(res).have.property('status',302);
                    done();
                })
        });

    }

});