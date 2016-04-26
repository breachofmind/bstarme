$.noty.defaults.animation = {
    open: 'animated slideInRight',
    close: {height:'toggle'},
    easing: 'swing',
    speed: 500
};
$.noty.defaults.layout = "topRight";;
(function(){
    var api = function(path)
    {
        return '/api/v1/'+path;
    };

    $.noty.defaults.timeout = 3000;

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

                // Models for the creation form.
                $scope.formSlug = null;
                $scope.formDestination = null;

                /**
                 * Array of items in the list table.
                 * @type {Array}
                 */
                this.items = [];

                /**
                 * Gets the data from the Creation form.
                 * @returns {{slug: null, destination: null, author: *}}
                 */
                this.getFormData = function()
                {
                    return {
                        slug: $scope.formSlug,
                        destination: $scope.formDestination,
                        author: USER._id
                    }
                };


                /**
                 * Creates a new redirect object.
                 * @returns {boolean}
                 */
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

                /**
                 * Updates an existing redirect object.
                 * @param item obj
                 * @param field string, optional
                 * @returns void
                 */
                this.update = function(item,field)
                {
                    // Checks the original field. If the same, don't need to update.
                    if (field && item._o === item[field]) {
                        item._o = null;
                        return;
                    }
                    $http.put(api('redirect/'+item._id), item).success(function(data) {
                        noty({text:"Updated.", type:"success"});
                    });
                };

                /**
                 * Deletes the redirect object from the database.
                 * @param item obj
                 * @param i int
                 * @returns void
                 */
                this.delete = function(item,i)
                {
                    $http.delete(api('redirect/'+item._id)).success(function(data) {
                        noty({text:"Deleted.", type:"success"});
                        ctrl.items.splice(i,1);
                    });
                };

                /**
                 * Gets the latest items from the db.
                 * @returns void
                 */
                this.refresh = function()
                {
                    $http.get(api('redirect')).success(function(json) {
                        ctrl.items = json.data;
                    });
                };

                /**
                 * Begin editing a field.
                 * @param item obj
                 * @param field string
                 */
                this.editing = function(item,field)
                {
                    item._o = item[field];
                };


                // Get things started.
                this.refresh();
            }
        }
    }]);

    window.core = core;
})();