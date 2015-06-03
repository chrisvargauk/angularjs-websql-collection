<h3>Context</h3>
Lets say you've created a "user" object. You are happy with the properties and you want to save objects.
<pre>
like the following user object.
var user = {
  name: 'John',
  age: '12'
};
</pre>

<h3>Create Collection</h3>
All you need to do is create a collection and pass in any user object as default.
This will basically register "user" as a "type" and prepares the DB to receive objects like you've passed as default.
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
