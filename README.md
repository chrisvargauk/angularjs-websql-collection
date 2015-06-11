As of mid 2015, IndexDB is tempting to use but for mobile applications - using web technologies - it's just not quite there yet.
I believe WebSQL is still better for indexed storage, even if it is not a standard anymore.
The problem is that WebSQL is a relational database and that makes it complicated to work with JSON objects.
The following Collection implementation makes it easy to use WebSQL with JSON objects.
The lib takes JSON objects and creates the related tables for you,
all you need to focus on is to keep adding new object to the collection and the lib takes care of storing those object for later.

<h3>Context</h3>
Lets say you've created a "user" object. You are happy with the properties and you want to save it.
<pre>
var user = {
  name: 'John',
  age: '12'
};
</pre>

<h3>Create Collection</h3>
All you need to do is, create a collection and pass in any user object as default.
This will basically register "user" as a "type" and prepares the DB to receive objects.
<pre>
var cUser = new Collection({
  type: 'user',
  default: user
});
</pre>

<h3>Add Model to Collection</h3>
Now if you want to add a new obj to the collection all you need to do is passing in the object to add method.
This method tries to add the user Model to WebSQL first and if that's successful than adds it to cUser.JSON.
<pre>
cUser.add({
 name: 'John',
 age: '12'
});
</pre>

<h3>Update Models in collection</h3>
You can access all your models in your collection through cUser.JSON. You can access the first Model in the Collection like this, cUser.JSON[0]. </br>
Feel free to update the value of any property, then all you need to do is call <code>cUser.check()</code>. This method check for differences between the JSON and WebSQL and updates the database.
<pre>
cUser.JSON[0].age = 23;
cUser.check();
</pre>

<h3>Delete Models from Collection</h3>
You can delete any Model from the Collection by calling removeById method.
<pre>
cUser.removeById('step', id);
</pre>

<h3>Asynchronous Calls</h3>
Interacting with WebSQL is of course asynchronous, therefore every interaction can have a callback to allow developers to queue these asynchronous calls.
<pre>
var callback = function () {
  console.log('done');
}

var cUser = new Collection({
  type: 'user',
  default: user,
  callback: callback
});

cUser.add({
  name: 'John',
  age: '12'
}, callback);

cUser.JSON[0].age = 23;
cUser.check(callback);

cUser.removeById('step', id, callback);
</pre>

<h3>Access to Collection in Angular</h3>
<pre>
Inject Collection constructor function.
angular.module('myApp', ['WebSQLCollection']).controller('AppCtrl', function (Collection) {
   ...
});
</pre>
