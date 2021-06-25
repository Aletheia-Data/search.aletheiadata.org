import React from 'react'
import fetch from 'unfetch'
import MiniSearch from 'minisearch'
import Papa from 'papaparse'
import numeral from 'numeral'

class Home extends React.PureComponent {
  constructor (props) {
    super(props)
    const miniSearch = new MiniSearch({
      fields: ["Nombre", "Funci�n", "Departamento", "Estatus", "Sueldo Bruto", "Mes", "A�o"],
      storeFields: ["Nombre", "Funci�n", "Departamento", "Estatus", "Sueldo Bruto", "Mes", "A�o"],
      processTerm: (term, _fieldName) => (term.length <= 1 || stopWords.has(term)) ? null : term.toLowerCase()
    })
    ;['handleSearchChange', 'handleSearchKeyDown', 'handleSuggestionClick',
      'handleSearchClear', 'handleAppClick', 'setSearchOption',
      'performSearch', 'setFromYear', 'setToYear'].forEach((method) => {
      this[method] = this[method].bind(this)
    })
    this.searchInputRef = React.createRef()
    this.state = {
      matchingItems: [],
      itemById: [],
      searchValue: '',
      ready: false,
      suggestions: [],
      selectedSuggestion: -1,
      fromYear: 1965,
      toYear: 2020,
      searchOptions: {
        fuzzy: 0.2,
        prefix: true,
        fields: ["Nombre", "Funci�n", "Departamento", "Estatus", "Sueldo Bruto", "Mes", "A�o"],
        combineWith: 'OR',
        filter: null
      },
      miniSearch
    }
  }

  componentDidMount () {

    const csv = "https://cors-anywhere.herokuapp.com/https://inefi.gob.do/datosabiertos/recursos_humanos/nomina_fija/datosabiertos_nomina_fija_inefi.csv";
    let results = [];
    const csvData = Papa.parse(csv, {
      download: true,
      dynamicTyping: true,
      header: true,
      complete: response => {
        
        results = response;
        let data = response.data;
        // add ids
        data.map((r, i) => { r.id = i; if (r.Nombre) return r; });
        console.log(results);
        // You can access the data here
        console.log(data);
        const { miniSearch } = this.state
        
        this.setState({ ready: true })
        return miniSearch.addAll(data);
      }
    });


    /*
    fetch('https://raw.githubusercontent.com/lucaong/minisearch/master/examples/billboard_1965-2015.json')
      .then(response => response.json())
      .then((allItems) => {
        
      }).then(() => {
        this.setState({ ready: true })
      })
    */
  }

  handleSearchChange ({ target: { value } }) {
    this.setState({ searchValue: value })
    const matchingItems = value.length > 1 ? this.searchItems(value) : []
    const selectedSuggestion = -1
    const suggestions = this.getSuggestions(value)
    this.setState({ matchingItems, suggestions, selectedSuggestion })
  }

  handleSearchKeyDown ({ which, key, keyCode }) {
    let { suggestions, selectedSuggestion, searchValue } = this.state
    if (key === 'ArrowDown') {
      selectedSuggestion = Math.min(selectedSuggestion + 1, suggestions.length - 1)
      searchValue = suggestions[selectedSuggestion].suggestion
    } else if (key === 'ArrowUp') {
      selectedSuggestion = Math.max(0, selectedSuggestion - 1)
      searchValue = suggestions[selectedSuggestion].suggestion
    } else if (key === 'Enter' || key === 'Escape') {
      selectedSuggestion = -1
      suggestions = []
      this.searchInputRef.current.blur()
    } else {
      return
    }
    const matchingItems = this.searchItems(searchValue)
    this.setState({ suggestions, selectedSuggestion, searchValue, matchingItems })
  }

  handleSuggestionClick (i) {
    let { suggestions } = this.state
    const searchValue = suggestions[i].suggestion
    const matchingItems = this.searchItems(searchValue)
    this.setState({ searchValue, matchingItems, suggestions: [], selectedSuggestion: -1 })
  }

  handleSearchClear () {
    this.setState({ searchValue: '', matchingItems: [], suggestions: [], selectedSuggestion: -1 })
  }

  handleAppClick () {
    this.setState({ suggestions: [], selectedSuggestion: -1 })
  }

  setSearchOption (option, valueOrFn) {
    if (typeof valueOrFn === 'function') {
      this.setState(({ searchOptions }) => ({
        searchOptions: { ...searchOptions, [option]: valueOrFn(searchOptions[option]) }
      }), this.performSearch)
    } else {
      this.setState(({ searchOptions }) => ({
        searchOptions: { ...searchOptions, [option]: valueOrFn }
      }), this.performSearch)
    }
  }

  setFromYear (year) {
    this.setState(({ toYear, searchOptions }) => {
      const fromYear = parseInt(year, 10)
      if (fromYear <= 1965 && toYear >= 2015) {
        return { fromYear, searchOptions: { ...searchOptions, filter: null } }
      } else {
        const filter = ({ year }) => {
          year = parseInt(year, 10)
          return year >= fromYear && year <= toYear
        }
        return { fromYear, searchOptions: { ...searchOptions, filter } }
      }
    }, this.performSearch)
  }

  setToYear (year) {
    this.setState(({ fromYear, searchOptions }) => {
      const toYear = parseInt(year, 10)
      if (fromYear <= 1965 && toYear >= 2015) {
        return { toYear, searchOptions: { ...searchOptions, filter: null } }
      } else {
        const filter = ({ year }) => {
          year = parseInt(year, 10)
          return year >= fromYear && year <= toYear
        }
        return { toYear, searchOptions: { ...searchOptions, filter } }
      }
    }, this.performSearch)
  }

  searchItems (query) {
    const { miniSearch, itemById, searchOptions } = this.state
    console.log(miniSearch.search(query, searchOptions));
    return miniSearch.search(query, searchOptions)
  }

  performSearch () {
    const { searchValue } = this.state
    const matchingItems = this.searchItems(searchValue)
    console.log(matchingItems);
    this.setState({ matchingItems })
  }

  getSuggestions (query) {
    const { miniSearch, searchOptions } = this.state
    const prefix = (term, i, terms) => i === terms.length - 1
    return miniSearch.autoSuggest(query, { ...searchOptions, prefix, boost: { artist: 5 } })
      .filter(({ suggestion, score }, _, [first]) => score > first.score / 4)
      .slice(0, 5)
  }

  render () {
    const { matchingItems, searchValue, ready, suggestions, selectedSuggestion, searchOptions, fromYear, toYear } = this.state
    return (
      <div className='App' onClick={this.handleAppClick}>
        <article className='main'>
          {
            ready
              ? <Header
                onChange={this.handleSearchChange} onKeyDown={this.handleSearchKeyDown}
                selectedSuggestion={selectedSuggestion} onSuggestionClick={this.handleSuggestionClick}
                onSearchClear={this.handleSearchClear} value={searchValue} suggestions={suggestions}
                searchInputRef={this.searchInputRef} searchOptions={searchOptions} setSearchOption={this.setSearchOption}
                setFromYear={this.setFromYear} setToYear={this.setToYear} fromYear={fromYear} toYear={toYear}
              />
              : <Loader />
          }
          {
            matchingItems && matchingItems.length > 0
              ? <ItemList Items={matchingItems} />
              : (ready && <Explanation />)
          }
        </article>
      </div>
    )
  }
}

const ItemList = ({ Items }) => (
  console.log(Items),
  <ul className='ItemList'>
    { Items.map((item, i) => Item(item, i)) }
  </ul>
)

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

const Item = (item, i) => {
  let result = item;
  return(
    <div style={{ width: '100%' }} key={`card_${i}}`}>
      <div className="courses-container col-xs-6">
          <div className="course">
              <div className="course-preview">
                  <h6>{ result.MINISTERIO }</h6>
                  <h2>{ result.NOMBRE_COMPLETO }</h2>
                  {/**<a href="#">View all details <i className="fas fa-chevron-right"></i></a> */}
              </div>
              <div className="course-info">
                  <h6>{ result.DEPARTAMENTO }</h6>
                  <pre>
                    <ul>
                      {
                        Object.keys(result).map((k, v) => {
                          let val = result[k];
                          let label = getLabelInfo(k,val);
                          return label
                        })
                      }
                  </ul></pre>
                  <button className="btn">RD$ { numeral(result.SUELDO_BRUTO).format('0,0.00') }</button>
              </div>
          </div>
      </div>
    </div>
  )
}

const Header = (props) => (
  <header className='Header'>
    <h1>Item Search</h1>
    <SearchBox {...props} />
  </header>
)

const SearchBox = ({
  onChange,
  onKeyDown,
  onSuggestionClick,
  onSearchClear,
  value,
  suggestions,
  selectedSuggestion,
  searchInputRef,
  searchOptions,
  setSearchOption,
  setFromYear,
  setToYear,
  fromYear,
  toYear
}) => (
  <div className='SearchBox'>
    <div className='Search'>
      <input type='text' value={value} onChange={onChange} onKeyDown={onKeyDown} ref={searchInputRef}
        autoComplete='none' autoCorrect='none' autoCapitalize='none' spellCheck='false' />
      <button className='clear' onClick={onSearchClear}>&times;</button>
    </div>
    {
      suggestions && suggestions.length > 0 &&
      <SuggestionList items={suggestions}
        selectedSuggestion={selectedSuggestion}
        onSuggestionClick={onSuggestionClick} />
    }
    <AdvancedOptions options={searchOptions} setOption={setSearchOption}
      setFromYear={setFromYear} setToYear={setToYear} fromYear={fromYear} toYear={toYear} />
  </div>
)

const SuggestionList = ({ items, selectedSuggestion, onSuggestionClick }) => (
  <ul className='SuggestionList'>
    {
      items.map(({ suggestion }, i) =>
        <Suggestion value={suggestion} selected={selectedSuggestion === i}
          onClick={(event) => onSuggestionClick(i, event)} key={i} />)
    }
  </ul>
)

const Suggestion = ({ value, selected, onClick }) => (
  <li className={`Suggestion ${selected ? 'selected' : ''}`} onClick={onClick}>{ value }</li>
)

const AdvancedOptions = ({ options, setOption, setFromYear, setToYear, fromYear, toYear }) => {
  const setField = (field) => ({ target: { checked } }) => {
    setOption('fields', (fields) => {
      return checked ? [...fields, field] : fields.filter(f => f !== field)
    })
  }
  const setKey = (key, trueValue = true, falseValue = false) => ({ target: { checked } }) => {
    setOption(key, checked ? trueValue : falseValue)
  }
  const { fields, combineWith, fuzzy, prefix } = options
  return (
    <details className='AdvancedOptions'>
      <summary>Advanced options</summary>
      <div className='options'>
        <div>
          <b>Search in fields:</b>
          <label>
            <input type='checkbox' checked={fields.includes('title')} onChange={setField('title')} />
            Title
          </label>
          <label>
            <input type='checkbox' checked={fields.includes('artist')} onChange={setField('artist')} />
            Artist
          </label>
        </div>
        <div>
          <b>Search options:</b>
          <label><input type='checkbox' checked={!!prefix} onChange={setKey('prefix')} /> Prefix</label>
          <label><input type='checkbox' checked={!!fuzzy} onChange={setKey('fuzzy', 0.2)} /> Fuzzy</label>
        </div>
        <div>
          <b>Combine terms with:</b>
          <label>
            <input type='radio' checked={combineWith === 'OR'}
              onChange={setKey('combineWith', 'OR', 'AND')} /> OR
          </label>
          <label><input type='radio' checked={combineWith === 'AND'}
            onChange={setKey('combineWith', 'AND', 'OR')} /> AND</label>
        </div>
        <div>
          <b>Filter:</b>
          <label>
            from year:
            <select
              value={fromYear}
              onChange={({ target: { value } }) => setFromYear(value)}>
              {
                years
                  .filter((year) => year <= toYear)
                  .map((year) => <option key={year} value={year}>{year}</option>)
              }
            </select>
          </label>
          <label>
            to year:
            <select
              value={toYear}
              onChange={({ target: { value } }) => setToYear(value)}>
              {
                years
                  .filter((year) => year >= fromYear)
                  .map((year) => <option key={year} value={year}>{year}</option>)
              }
            </select>
          </label>
        </div>
      </div>
    </details>
  )
}

const Explanation = () => (
  <p>
    This is a demo of the <a
      href='https://github.com/lucaong/minisearch'>MiniSearch</a> JavaScript
    library: try searching through more than 5000 top Items and artists
    in <em>Billboard Hot 100</em> from year 1965 to 2015. This example
    demonstrates search (with prefix and fuzzy match) and auto-completion.
  </p>
)

const Loader = ({ text }) => (
  <div className='Loader'>{ text || 'loading...' }</div>
)

const capitalize = (string) => string.replace(/(\b\w)/gi, (char) => char.toUpperCase())

const stopWords = new Set(['the', 'a', 'an', 'and'])

const years = []
for (let y = 1965; y <= 2015; y++) { years.push(y) }

export default Home;

