/**
 * Created by developer on 22-10-15.
 */
serviceObject.filterCategories = function(movieList){
    var filteredArray = [];
    movieList.forEach(function(movie){
        movie.categories.forEach(function(category){
            if(filteredArray.indexOf(category) > -1){
                return;
            }
            else{
                filteredArray.push(category);
            }
        })
    })
    return filteredArray;
}