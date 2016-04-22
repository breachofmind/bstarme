(function(){
    var api = function(path)
    {
        return '/api/v1/'+path;
    };

    var core = angular.module('core', []);

    core.run(function($http) {
        $http.defaults.headers.common['CSRF-TOKEN'] = $('meta[name="csrf-token"]').attr('content');
    });

    core.directive('redirectList', ['$http', function($http)
    {

        return {
            restrict:"E",
            templateUrl:"/template/redirectList.html",
            controllerAs:"list",
            controller:function($scope)
            {
                var ctrl = this;
                $scope.formSlug = null;
                $scope.formDestination = null;

                this.items = [];

                this.getFormData = function()
                {
                    return {
                        slug: $scope.formSlug,
                        destination: $scope.formDestination,
                        author: USER._id
                    }
                };



                this.create = function()
                {
                    if ($scope.newItemForm.$valid) {
                        $http.post(api('redirect'), this.getFormData()).success(function(data) {
                            noty({text:"Created redirect.", type:"success"});
                            ctrl.refresh();
                        });
                        return true;
                    }

                    noty({text:"Form is not valid, please check.", type:"alert"});
                };

                this.update = function(item)
                {
                    $http.put(api('redirect/'+item._id), item).success(function(data) {
                        noty({text:"Updated.", type:"success"});
                    });
                };

                this.delete = function(item,i)
                {
                    $http.delete(api('redirect/'+item._id)).success(function(data) {
                        noty({text:"Deleted.", type:"success"});
                        ctrl.items.splice(i,1);
                    });
                };

                this.refresh = function()
                {
                    $http.get(api('redirect')).success(function(json) {
                        ctrl.items = json.data;
                    });
                };



                this.refresh();
            }
        }
    }]);

    window.core = core;
})();