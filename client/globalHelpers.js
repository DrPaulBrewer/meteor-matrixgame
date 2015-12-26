/* globals G */

// make all the myGame functions defined in G.templateHelpers global helpers
for(var k in G.templateHelpers){
    if (G.templateHelpers.hasOwnProperty(k)){
	Template.registerHelper(k, G.templateHelpers[k]);
    }
}
