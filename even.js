function checkEvenNumber(num) {
  return new Promise(function(resolve, reject) {
    if (num % 2 === 0) {
      resolve("Yes, it's an even number.");
    } else {
      reject("Oops! That's an odd number.");
    }
  });
}

// Test with a number
checkEvenNumber(4)
  .then(function(result) {
    console.log(result);
  })
  .catch(function(error) {
    console.log(error);
  });
