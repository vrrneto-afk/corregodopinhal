(function(){

  function dateFromInput(value){
    if(!value) return null;

    const [y, m, d] = value.split("-");
    return new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      12, 0, 0 // 🔒 meio-dia: nunca volta dia
    );
  }

  function toTimestampFromInput(value){
    const d = dateFromInput(value);
    return d ? firebase.firestore.Timestamp.fromDate(d) : null;
  }

  // 🌍 expõe globalmente
  window.DateUtils = {
    fromInput: dateFromInput,
    toTimestampFromInput
  };

})();
