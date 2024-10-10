var StyleSheet = require('react-native').StyleSheet;
 class NestedStyleSheet {
   static create(obj: {[key: string]: any}): {[key: string]: number} {
       var result = {};
       for (var key in obj) {
           var styleObj = obj[key];
           var styleObjKeys = Object.keys(styleObj);
           result[key] = StyleSheet.create(styleObj);
         }
         return result;
     }
 }
 
 export default NestedStyleSheet;