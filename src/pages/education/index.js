import React, { useState } from "react";

import MiniSearch from 'minisearch';
import Papa from 'papaparse'
import numeral from 'numeral';

import '../../styles/search.css';

const miniSearch = new MiniSearch({
  fields: ["Nombre", "Funci�n", "Departamento", "Estatus", "Sueldo Bruto", "Mes", "A�o"], // fields to index for full-text search
  storeFields: ["Nombre", "Funci�n", "Departamento", "Estatus", "Sueldo Bruto", "Mes", "A�o"], // fields to return with search results
  searchOptions: {
    boost: { Nombre: 2 },
    fuzzy: 0.15
  }
})

const csv = "https://cors-anywhere.herokuapp.com/https://inefi.gob.do/datosabiertos/recursos_humanos/nomina_fija/datosabiertos_nomina_fija_inefi.csv";
const csvData = Papa.parse(csv, {
  download: true,
  dynamicTyping: true,
  header: true,
  complete: response => {
    
    let data = response.data;
    console.log('GET Data: ', data);
    // add ids
    data.map((r, i) => { r.id = i; if (r.Nombre) return r; });
    // Index all documents
    miniSearch.addAll(data)
  }
});

export default function Home() {

  let loading = false;

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [resultsPerPage, setResultsPerPage] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  
  const isServiceField = (key) =>{
    switch (key) {
      case 'highlight':
        return true
      case '_index':
        return true
      case '_type':
        return true
      case '_doc':
        return true
      case '_id':
        return true
      case '_score':
        return true
      case '_click_id':
        return true
      default:
        return false
    }
  }

  const getLabelInfo = (key, value) =>{
    console.log(key, value);
    if (!isServiceField(key)){
      let skip = false;
      let isLink = false;
      switch (key) {
        case 'ANO':
          key = 'Año'
          break;
        case 'NOMBRE_COMPLETO':
            key = 'Nombre Completo'
            break;
        case 'SEGURO_PENSION_EMPLEADO':
            skip = true;
            key = 'SEGURO_PENSION_EMPLEADO'
            break;
        case 'SUBTOTAL_TSS':
            skip = true;
            key = 'Subtotal Tss'
            break;
        case 'SEGURO_PENSION_PATRONAL':
            skip = true;
            key = 'SEGURO_PENSION_PATRONAL'
            break;
        case 'SEGURO_SALUD_EMPLEADO_PATRONAL':
            skip = true;
            key = 'SEGURO_SALUD_EMPLEADO_PATRONAL'
            break;
        case 'REGISTRO_DEPENDIENTES_ADD':
            skip = true;
            key = 'REGISTRO_DEPENDIENTES_ADD'
            break;
        case 'FUENTE':
            isLink=true;
            key = 'Fuente'
            break;
        case 'TERMINO':
            if (value === '00/00/0000') skip=true
            key = 'Termino'
            break;
        case 'ISR':
            if (value === 0) skip=true
            key = 'ISR'
            break;
        case 'APORTES_PATRONAL':
            skip = true;
            key = 'APORTES_PATRONAL'
            break;
        case 'SUELDO_BRUTO':
            value = `RD$ ${ numeral(value).format('0,0.00') }`;
            key = 'Sueldo Bruto'
            break;
        case 'TIPO_DE_EMPLEADO':
            key = 'Tipo de Empleado'
            break;
        case 'CARGO':
            key = 'Cargo'
            break;
        case 'MINISTERIO':
            key = 'Ministerio'
            break;
        case 'SUELDO_NETO':
            value = `RD$ ${ numeral(value).format('0,0.00') }`;
            key = 'Sueldo Neto'
            break;
        case 'SUELDO_US':
            if (value === 0) skip=true
            value = `$US ${ numeral(value).format('0,0.00') }`;
            key = 'Sueldo'
            break;
        case 'SEGURO_SAV_ICA':
            skip = true;
            key = 'SEGURO_SAV_ICA'
            break;
        case 'RIESGOS_LABORALES':
            skip = true;
            key = 'RIESGOS_LABORALES'
            break;
        case 'INICIO':
            if (value === '00/00/0000') skip=true
            key = 'Inicio'
            break;
        case 'MES':
            key = 'Mes'
            break;
        case 'DEPARTAMENTO':
            key = 'Departamento'
            break;
        case 'TOT_RETENCIONES_DEDUCCION_EMPLEADO':
            skip = true;
            key = 'TOT_RETENCIONES_DEDUCCION_EMPLEADO'
            break;
        case 'SEGURO_SALUD_EMPLEADO':
            skip = true;
            key = 'SEGURO_SALUD_EMPLEADO'
            break;
        case 'GASTOS_DE_REPRESENTACION_US':
            if (value === 0) skip=true
            value = `$US ${ numeral(value).format('0,0.00') }`;
            key = 'Gastos de Representacion'
            break;
        case 'TIPO_DE_EMPLEADO_CARGO':
            key = 'Tipo de Cargo'
            break;
        case 'ESTATU_EMPLEADO':
            key = 'Estatus Empleado'
            break;
        case 'TASA_RD':
          if (value === 0) skip=true
          value = `$RD ${ numeral(value).format('0,0.00') }`;
          key = 'Tasa de Cambio'
          break;
        case 'SUELDO_EUR':
          if (value === 0) skip=true
          value = `$EUR ${ numeral(value).format('0,0.00') }`;
          key = 'Sueldo'
          break;
        default:
      }
      if (!skip){
        if (isLink) return <li key={key} style={{ display: 'flex',alignItems: 'flex-start', whiteSpace: 'break-spaces' }}><b>{ key }:</b> <p style={{ margin: 0,marginLeft: 10 }}><a href={value} target='_blank' >{ 'Portal' }</a></p></li>;
        return <li key={key} style={{ display: 'flex',alignItems: 'flex-start', whiteSpace: 'break-spaces' }}><b>{ key }:</b> <p style={{ margin: 0,marginLeft: 10 }}>{ value }</p></li>;
      }
    }
  }

  const Card = (result, i) =>{
    console.log(result);
    return(
      <div style={{ width: '100%' }} key={`card_${i}}`}>
          <div className="courses-container col-xs-6">
              <div className="course">
                  <div className="course-preview">
                      <h6>{ result.Nombre }</h6>
                      <h2>{ result.Nombre }</h2>
                  </div>
                  {/**
                   *  <div className="course-info">
                      <h6>{ result.DEPARTAMENTO }</h6>
                      <pre>
                        <ul>
                          {
                            Object.keys(result).map((k, v) => {
                              let val = result[k];
                              let label = getLabelInfo(k,val);
                              console.log(result);
                              return label
                            })
                          }
                      </ul></pre>
                      <button className="btn">RD$ { numeral(result.SUELDO_BRUTO).format('0,0.00') }</button>
                  </div>
                   */}
              </div>
          </div>
      </div>
    )
  }

  const searchChange = (e) =>{
    loading = true;
    e.persist();
    (async () => {
      let value = e.target.value;
      setSearch(value);
      let res = miniSearch.search(value);
      console.log('setting query result: ', res);
      setResults(res);
      if (res.length > 0){
        changePage(page, res);
      } else {
        setResultsPerPage(res);
      }
   })();   
    
  }

  const handlePageClick = (data) =>{
    let selected = data.selected;
    let offset = Math.ceil(selected * perPage);

    this.setState({ offset: offset }, () => {
      this.loadCommentsFromServer();
    });
  };

  const prevPage = () =>
  {
      if (page > 1) {
        page--;
        changePage(page, results);
      }
  }

  const nextPage = () =>
  {
      if (page < numPages()) {
        page++;
        changePage(page, results);
      }
  }

  const changePage = (page, results) =>
  {
      console.log('changing page: ', page);

      var btn_next = document.getElementById("btn_next");
      var btn_prev = document.getElementById("btn_prev");
      
      // Validate page
      if (page < 1) page = 1;
      if (page > numPages()) page = numPages();

      console.log(results);
      let res = [];
      for (var i = (page-1) * perPage; i < (page * perPage); i++) {
        console.log('i: ', i);
        console.log('from: ', (page-1) * perPage);
        console.log('to: ', page * perPage);
        console.log('res: ', results[Math.abs(i)]);
        res.push(results[Math.abs(i)]);
      }
      
      // setResults(results)
      console.log(res);
      setResultsPerPage(res);
      
      if (page == 1) {
          btn_prev.style.visibility = "hidden";
      } else {
          btn_prev.style.visibility = "visible";
      }

      if (page == numPages()) {
          btn_next.style.visibility = "hidden";
      } else {
          btn_next.style.visibility = "visible";
      }
  }

  const numPages = () =>
  {
      return Math.ceil(results.length / perPage);
  }

  return (
      <div>
        <p>Edu</p>
        <input type= "text" 
          name= {'search'}
          value = {search}
          onChange = { (e) => searchChange(e) } 
          disabled = { loading }
        />
        {
          resultsPerPage.length > 0 &&
          resultsPerPage.map((res, i) => {
            console.log(res);
            return Card(res, i);
          })
        }
        <div className="pagination">
          <a href="#" onClick={prevPage} id="btn_prev">Prev</a>
          <a href="#" onClick={nextPage} id="btn_next">Next</a>
          page: <span id="page">{ page }</span>
        </div>
      </div>
  );
}
