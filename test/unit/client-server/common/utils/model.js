define([
    'intern!bdd',
    'intern/chai!',
    'intern/chai!expect',
    'sinon',
    'sinon-chai',
    'test/unit/utils',
    'utils/model',
    'lazoModel',
], function (bdd, chai, expect, sinon, sinonChai, utils, utilModel, LazoModel) {
    chai.use(sinonChai);

    with (bdd) {
        describe('commonUtilsModel', function () {

            describe('#create', function(){
                it('should create model but not call save', function () {
                    this.skip();
                    var dfd = this.async();

                    LAZO.require = function (path, success, error) {
                        success(LazoModel);
                    };
                    var saveSpy = sinon.spy(LazoModel.prototype, 'save'),
                        ctx = {
                            _rootCtx: {
                                modelList: {},
                                modelInstances: {}
                            }
                        };
                    utilModel.create('foo',
                        {abc:'xyz'},
                        {
                            persist: false,
                            params: {
                                id: 'bar'
                            },
                            ctx: ctx,
                            success: function (m) {
                                expect(m).to.not.be.null;
                                expect(saveSpy).to.not.be.called;
                                saveSpy.restore();
                                dfd.resolve();
                            }
                        },
                        'model'
                    );

                });

                it('should create model and call save', function () {
                    this.skip();
                    var dfd = this.async();
                    LAZO.require = function (path, success, error) {
                        success(LazoModel);
                    };
                    var saveSpy = sinon.stub(LazoModel.prototype, 'save', function (attrs, options) {
                            options.success({});
                        }),
                        ctx = {
                            _rootCtx: {
                                modelList: {},
                                modelInstances: {}
                            }
                        };
                    utilModel.create('foo',
                        {abc:'xyz'},
                        {
                            params: {
                                id: 'bar'
                            },
                            ctx: ctx,
                            success: function (m) {
                                expect(m).to.not.be.null;
                                expect(saveSpy).to.have.been.called;
                                saveSpy.restore();
                                dfd.resolve();
                            }
                        },
                        'model'
                    );

                });

                it('should only call `options.success` once if the model is already loaded', function () {
                    this.skip();
                    var dfd = this.async();
                    var ctx = {
                            _rootCtx: {
                                modelList: {},
                                modelInstances: {
                                    'GET:foo': 'blah'
                                }
                            }
                        },
                        successSpy,
                        options = {
                            persist: false,
                            ctx: ctx,
                            success: function(model){
                                expect(successSpy).to.have.been.calledOnce;
                                dfd.resolve();
                            }
                        };

                    successSpy = sinon.spy(options, 'success');
                    utilModel.create('foo', {}, options, 'model');
                });


            });
            describe('#process', function(){
                it('should process a model but not call fetch if fetch is false', function () {

                    var dfd = this.async();
                    LAZO.require = function (path, success, error) {
                        success(LazoModel);
                    };
                    var fetchSpy = sinon.spy(LazoModel.prototype, 'fetch'),
                    ctx = {
                        _rootCtx: {
                            modelList: {},
                            modelInstances: {}
                        }
                    };

                    LAZO.files.appViews = LAZO.files.appViews || {};
                    LAZO.files.models = LAZO.files.models || {};
                    LAZO.files.models['models/foo/model.js'] = true;
                    
                    utilModel.process('foo',
                        {
                            ctx: ctx,
                            fetch: false,
                            success: function (m) {
                                expect(m).to.not.be.null;
                                expect(fetchSpy).to.not.be.called;
                                fetchSpy.restore();
                                dfd.resolve();
                            }
                        },
                        'model'
                    );

                });

                it('should process children', function () {

                    var dfd = this.async();
                    var ParentModel = LazoModel.extend({
                        modelsSchema: [
                            {
                                name: 'child',
                                locator: 'foo.bar.baz',
                                prop: 'theProp'
                            }
                        ],
                        fetch: function(options) {
                            this._resp = {
                                foo: {
                                    bar: {
                                        baz: {
                                            a: 'b'
                                        }
                                    }
                                }
                            };
                            options.success(this);    
                        }
                    });
                    var ChildModel = LazoModel.extend({
                        fetch: function(options) {
                            options.success(this);
                        }
                    });
                    var ctx = {
                        _rootCtx: {
                            modelList: {},
                            modelInstances: {}
                        }
                    };
                    
                    LAZO.require = function (path, success, error) {
                        if (path[0] === 'models/parent/model') {
                            return success(ParentModel);
                        }
                        else {
                            return success(ChildModel);
                        }
                    };
                    
                    LAZO.files.appViews = LAZO.files.appViews || {};
                    LAZO.files.models = LAZO.files.models || {};
                    LAZO.files.models['models/parent/model.js'] = true;
                    LAZO.files.models['models/child/model.js'] = true;
                    
                    utilModel.process('parent',
                        {
                            ctx: ctx,
                            success: function (m) {
                                expect(m.theProp).to.not.be.undefined;
                                expect(m.theProp.get('a')).to.equal('b');
                                dfd.resolve();
                            }
                        },
                        'model'
                    );

                });

            });
        });

    }
});