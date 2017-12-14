var React = require('react');

const param = require('jquery-param');

import styles from 'xbuilder-templates/style/helpers/paginator.css';

var Paginator = React.createClass({
    getInitialState() {
        var $PAGINATION_PADDING = 5;
        var $paginator = {};
        var $currentPage = Number(this.props.currentPage);

        var $maxPages = Math.floor(this.props.total / this.props.countPerPage) + 1;

        $paginator.current = $currentPage;

        if ($currentPage > 1) {
            $paginator.previous = $currentPage - 1;
        }

        if ($currentPage < $maxPages) {
            $paginator.next = $currentPage + 1;
        }

        $paginator.pageCount = $maxPages;

        if (($currentPage - $PAGINATION_PADDING) <= 0) {
            var $endRange = (10 > $maxPages) ? $maxPages : 10;
            $paginator.pagesInRange = Array.apply(null, Array($endRange)).map(function (_, i) {return i + 1});
        } else {
            var $endRange = (($currentPage + $PAGINATION_PADDING) > $maxPages) ? $maxPages : ($currentPage + $PAGINATION_PADDING);
            $paginator.pagesInRange = Array.apply(null, Array($endRange)).map(function (_, i) {return i + $currentPage - $PAGINATION_PADDING;});
        }

        return {
            paginator: $paginator
        }
    },
    render: function() {
        var p = this.props;
        var s = this.state;
        
        var url = p.url || '';
        var queryParams = p.queryParams || {};

        return !s.paginator.pageCount ? null :(
            <div>
                <ul className={p.className || styles.pagination}>
                    {/*} Previous page link */}
                    {s.paginator.previous ?
                        <li>
                            <a
                                onClick={p.onClick}
                                data-page ={s.paginator.previous}
                                data-href={url + '?' + param(Object.assign({}, Object.keys(queryParams).length ? queryParams : {}, {page:s.paginator.previous}))}
                                href={p.noHref ? '#' : (url + '?' + param(Object.assign({}, Object.keys(queryParams).length ? queryParams : {}, {page:s.paginator.previous})))}
                            >
                                &#x3c;&#x3c;
                            </a>
                        </li>
                    :
                        <li className="disabled">
                            <a href="#">
                                &#x3c;
                            </a>
                        </li>
                    }

                    {/* Numbered page links */}
                    {s.paginator.pagesInRange.map((page,i)=>{
                        return (<li key={i} className={page != s.paginator.current ? '' : 'active'}>
                                    <a
                                        onClick={p.onClick}
                                        data-page ={page}
                                        data-href={page != s.paginator.current ? url + '?' + param(Object.assign({}, Object.keys(queryParams).length ? queryParams : {}, {page:page})) : '#'}
                                        href={p.noHref ? '#' : (page != s.paginator.current ? url + '?' + param(Object.assign({}, Object.keys(queryParams).length ? queryParams : {}, {page:page})) : '#')}
                                    >
                                        {page}
                                    </a>
                                </li>)
                    })}

                    {/* Next page link */}
                    {s.paginator.next ?
                        <li>
                            <a
                                onClick={p.onClick}
                                data-page ={s.paginator.next}
                                data-href={url + '?' + param(Object.assign({}, Object.keys(queryParams).length ? queryParams : {}, {page:s.paginator.next}))}
                                href={p.noHref ? '#' : (url + '?' + param(Object.assign({}, Object.keys(queryParams).length ? queryParams : {}, {page:s.paginator.next})))}
                            >
                                &#x3e;&#x3e;
                            </a>
                        </li>
                    :
                        <li className="disabled">
                            <a href="#">
                                &#x3e;
                            </a>
                        </li>
                    }
                </ul>
            </div>
        );
    }

});

module.exports = Paginator;