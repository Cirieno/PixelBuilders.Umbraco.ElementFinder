var se = (e) => {
  throw TypeError(e);
};
var ae = (e, t, r) => t.has(e) || se("Cannot " + r);
var H = (e, t, r) => (ae(e, t, "read from private field"), r ? r.call(e) : t.get(e)), ne = (e, t, r) => t.has(e) ? se("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), ie = (e, t, r, s) => (ae(e, t, "write to private field"), s ? s.call(e, r) : t.set(e, r), r);
import "@umbraco-cms/backoffice/extension-api";
import { UMB_AUTH_CONTEXT as Ue } from "@umbraco-cms/backoffice/auth";
import { LitElement as he, html as h, css as pe, state as _, customElement as fe } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as ge } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT as Ne, UMB_WORKSPACE_MODAL as _e } from "@umbraco-cms/backoffice/workspace";
import { UMB_DOCUMENT_ENTITY_TYPE as M, UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN as ye } from "@umbraco-cms/backoffice/document";
import { UmbControllerBase as je } from "@umbraco-cms/backoffice/class-api";
import "@umbraco-cms/backoffice/controller-api";
import { UmbContextToken as qe } from "@umbraco-cms/backoffice/context-api";
import { UmbModalRouteRegistrationController as me } from "@umbraco-cms/backoffice/router";
import { UUISelectElement as De } from "@umbraco-cms/backoffice/external/uui";
import "@umbraco-cms/backoffice/extension-registry";
const Be = {
  bodySerializer: (e) => JSON.stringify(
    e,
    (t, r) => typeof r == "bigint" ? r.toString() : r
  )
}, Re = ({
  onRequest: e,
  onSseError: t,
  onSseEvent: r,
  responseTransformer: s,
  responseValidator: a,
  sseDefaultRetryDelay: c,
  sseMaxRetryAttempts: i,
  sseMaxRetryDelay: o,
  sseSleepFn: l,
  url: d,
  ...n
}) => {
  let p;
  const j = l ?? ((u) => new Promise((g) => setTimeout(g, u)));
  return { stream: async function* () {
    let u = c ?? 3e3, g = 0;
    const S = n.signal ?? new AbortController().signal;
    for (; !S.aborted; ) {
      g++;
      const q = n.headers instanceof Headers ? n.headers : new Headers(n.headers);
      p !== void 0 && q.set("Last-Event-ID", p);
      try {
        const A = {
          redirect: "follow",
          ...n,
          body: n.serializedBody,
          headers: q,
          signal: S
        };
        let v = new Request(d, A);
        e && (v = await e(d, A));
        const y = await (n.fetch ?? globalThis.fetch)(v);
        if (!y.ok)
          throw new Error(
            `SSE failed: ${y.status} ${y.statusText}`
          );
        if (!y.body) throw new Error("No body in SSE response");
        const w = y.body.pipeThrough(new TextDecoderStream()).getReader();
        let V = "";
        const Q = () => {
          try {
            w.cancel();
          } catch {
          }
        };
        S.addEventListener("abort", Q);
        try {
          for (; ; ) {
            const { done: ke, value: Oe } = await w.read();
            if (ke) break;
            V += Oe;
            const Z = V.split(`

`);
            V = Z.pop() ?? "";
            for (const Ie of Z) {
              const ze = Ie.split(`
`), W = [];
              let ee;
              for (const m of ze)
                if (m.startsWith("data:"))
                  W.push(m.replace(/^data:\s*/, ""));
                else if (m.startsWith("event:"))
                  ee = m.replace(/^event:\s*/, "");
                else if (m.startsWith("id:"))
                  p = m.replace(/^id:\s*/, "");
                else if (m.startsWith("retry:")) {
                  const re = Number.parseInt(
                    m.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(re) || (u = re);
                }
              let C, te = !1;
              if (W.length) {
                const m = W.join(`
`);
                try {
                  C = JSON.parse(m), te = !0;
                } catch {
                  C = m;
                }
              }
              te && (a && await a(C), s && (C = await s(C))), r == null || r({
                data: C,
                event: ee,
                id: p,
                retry: u
              }), W.length && (yield C);
            }
          }
        } finally {
          S.removeEventListener("abort", Q), w.releaseLock();
        }
        break;
      } catch (A) {
        if (t == null || t(A), i !== void 0 && g >= i)
          break;
        const v = Math.min(
          u * 2 ** (g - 1),
          o ?? 3e4
        );
        await j(v);
      }
    }
  }() };
}, We = (e) => {
  switch (e) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, Me = (e) => {
  switch (e) {
    case "form":
      return ",";
    case "pipeDelimited":
      return "|";
    case "spaceDelimited":
      return "%20";
    default:
      return ",";
  }
}, Le = (e) => {
  switch (e) {
    case "label":
      return ".";
    case "matrix":
      return ";";
    case "simple":
      return ",";
    default:
      return "&";
  }
}, be = ({
  allowReserved: e,
  explode: t,
  name: r,
  style: s,
  value: a
}) => {
  if (!t) {
    const o = (e ? a : a.map((l) => encodeURIComponent(l))).join(Me(s));
    switch (s) {
      case "label":
        return `.${o}`;
      case "matrix":
        return `;${r}=${o}`;
      case "simple":
        return o;
      default:
        return `${r}=${o}`;
    }
  }
  const c = We(s), i = a.map((o) => s === "label" || s === "simple" ? e ? o : encodeURIComponent(o) : L({
    allowReserved: e,
    name: r,
    value: o
  })).join(c);
  return s === "label" || s === "matrix" ? c + i : i;
}, L = ({
  allowReserved: e,
  name: t,
  value: r
}) => {
  if (r == null)
    return "";
  if (typeof r == "object")
    throw new Error(
      "Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these."
    );
  return `${t}=${e ? r : encodeURIComponent(r)}`;
}, ve = ({
  allowReserved: e,
  explode: t,
  name: r,
  style: s,
  value: a,
  valueOnly: c
}) => {
  if (a instanceof Date)
    return c ? a.toISOString() : `${r}=${a.toISOString()}`;
  if (s !== "deepObject" && !t) {
    let l = [];
    Object.entries(a).forEach(([n, p]) => {
      l = [
        ...l,
        n,
        e ? p : encodeURIComponent(p)
      ];
    });
    const d = l.join(",");
    switch (s) {
      case "form":
        return `${r}=${d}`;
      case "label":
        return `.${d}`;
      case "matrix":
        return `;${r}=${d}`;
      default:
        return d;
    }
  }
  const i = Le(s), o = Object.entries(a).map(
    ([l, d]) => L({
      allowReserved: e,
      name: s === "deepObject" ? `${r}[${l}]` : l,
      value: d
    })
  ).join(i);
  return s === "label" || s === "matrix" ? i + o : o;
}, Fe = /\{[^{}]+\}/g, Ve = ({ path: e, url: t }) => {
  let r = t;
  const s = t.match(Fe);
  if (s)
    for (const a of s) {
      let c = !1, i = a.substring(1, a.length - 1), o = "simple";
      i.endsWith("*") && (c = !0, i = i.substring(0, i.length - 1)), i.startsWith(".") ? (i = i.substring(1), o = "label") : i.startsWith(";") && (i = i.substring(1), o = "matrix");
      const l = e[i];
      if (l == null)
        continue;
      if (Array.isArray(l)) {
        r = r.replace(
          a,
          be({ explode: c, name: i, style: o, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        r = r.replace(
          a,
          ve({
            explode: c,
            name: i,
            style: o,
            value: l,
            valueOnly: !0
          })
        );
        continue;
      }
      if (o === "matrix") {
        r = r.replace(
          a,
          `;${L({
            name: i,
            value: l
          })}`
        );
        continue;
      }
      const d = encodeURIComponent(
        o === "label" ? `.${l}` : l
      );
      r = r.replace(a, d);
    }
  return r;
}, He = ({
  baseUrl: e,
  path: t,
  query: r,
  querySerializer: s,
  url: a
}) => {
  const c = a.startsWith("/") ? a : `/${a}`;
  let i = (e ?? "") + c;
  t && (i = Ve({ path: t, url: i }));
  let o = r ? s(r) : "";
  return o.startsWith("?") && (o = o.substring(1)), o && (i += `?${o}`), i;
};
function Ge(e) {
  const t = e.body !== void 0;
  if (t && e.bodySerializer)
    return "serializedBody" in e ? e.serializedBody !== void 0 && e.serializedBody !== "" ? e.serializedBody : null : e.body !== "" ? e.body : null;
  if (t)
    return e.body;
}
const Je = async (e, t) => {
  const r = typeof t == "function" ? await t(e) : t;
  if (r)
    return e.scheme === "bearer" ? `Bearer ${r}` : e.scheme === "basic" ? `Basic ${btoa(r)}` : r;
}, we = ({
  allowReserved: e,
  array: t,
  object: r
} = {}) => (a) => {
  const c = [];
  if (a && typeof a == "object")
    for (const i in a) {
      const o = a[i];
      if (o != null)
        if (Array.isArray(o)) {
          const l = be({
            allowReserved: e,
            explode: !0,
            name: i,
            style: "form",
            value: o,
            ...t
          });
          l && c.push(l);
        } else if (typeof o == "object") {
          const l = ve({
            allowReserved: e,
            explode: !0,
            name: i,
            style: "deepObject",
            value: o,
            ...r
          });
          l && c.push(l);
        } else {
          const l = L({
            allowReserved: e,
            name: i,
            value: o
          });
          l && c.push(l);
        }
    }
  return c.join("&");
}, Ke = (e) => {
  var r;
  if (!e)
    return "stream";
  const t = (r = e.split(";")[0]) == null ? void 0 : r.trim();
  if (t) {
    if (t.startsWith("application/json") || t.endsWith("+json"))
      return "json";
    if (t === "multipart/form-data")
      return "formData";
    if (["application/", "audio/", "image/", "video/"].some(
      (s) => t.startsWith(s)
    ))
      return "blob";
    if (t.startsWith("text/"))
      return "text";
  }
}, Xe = (e, t) => {
  var r, s;
  return t ? !!(e.headers.has(t) || (r = e.query) != null && r[t] || (s = e.headers.get("Cookie")) != null && s.includes(`${t}=`)) : !1;
}, Ye = async ({
  security: e,
  ...t
}) => {
  for (const r of e) {
    if (Xe(t, r.name))
      continue;
    const s = await Je(r, t.auth);
    if (!s)
      continue;
    const a = r.name ?? "Authorization";
    switch (r.in) {
      case "query":
        t.query || (t.query = {}), t.query[a] = s;
        break;
      case "cookie":
        t.headers.append("Cookie", `${a}=${s}`);
        break;
      case "header":
      default:
        t.headers.set(a, s);
        break;
    }
  }
}, oe = (e) => He({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : we(e.querySerializer),
  url: e.url
}), le = (e, t) => {
  var s;
  const r = { ...e, ...t };
  return (s = r.baseUrl) != null && s.endsWith("/") && (r.baseUrl = r.baseUrl.substring(0, r.baseUrl.length - 1)), r.headers = Ee(e.headers, t.headers), r;
}, Qe = (e) => {
  const t = [];
  return e.forEach((r, s) => {
    t.push([s, r]);
  }), t;
}, Ee = (...e) => {
  const t = new Headers();
  for (const r of e) {
    if (!r)
      continue;
    const s = r instanceof Headers ? Qe(r) : Object.entries(r);
    for (const [a, c] of s)
      if (c === null)
        t.delete(a);
      else if (Array.isArray(c))
        for (const i of c)
          t.append(a, i);
      else c !== void 0 && t.set(
        a,
        typeof c == "object" ? JSON.stringify(c) : c
      );
  }
  return t;
};
class G {
  constructor() {
    this.fns = [];
  }
  clear() {
    this.fns = [];
  }
  eject(t) {
    const r = this.getInterceptorIndex(t);
    this.fns[r] && (this.fns[r] = null);
  }
  exists(t) {
    const r = this.getInterceptorIndex(t);
    return !!this.fns[r];
  }
  getInterceptorIndex(t) {
    return typeof t == "number" ? this.fns[t] ? t : -1 : this.fns.indexOf(t);
  }
  update(t, r) {
    const s = this.getInterceptorIndex(t);
    return this.fns[s] ? (this.fns[s] = r, t) : !1;
  }
  use(t) {
    return this.fns.push(t), this.fns.length - 1;
  }
}
const Ze = () => ({
  error: new G(),
  request: new G(),
  response: new G()
}), et = we({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), tt = {
  "Content-Type": "application/json"
}, Pe = (e = {}) => ({
  ...Be,
  headers: tt,
  parseAs: "auto",
  querySerializer: et,
  ...e
}), rt = (e = {}) => {
  let t = le(Pe(), e);
  const r = () => ({ ...t }), s = (d) => (t = le(t, d), r()), a = Ze(), c = async (d) => {
    const n = {
      ...t,
      ...d,
      fetch: d.fetch ?? t.fetch ?? globalThis.fetch,
      headers: Ee(t.headers, d.headers),
      serializedBody: void 0
    };
    n.security && await Ye({
      ...n,
      security: n.security
    }), n.requestValidator && await n.requestValidator(n), n.body !== void 0 && n.bodySerializer && (n.serializedBody = n.bodySerializer(n.body)), (n.body === void 0 || n.serializedBody === "") && n.headers.delete("Content-Type");
    const p = oe(n);
    return { opts: n, url: p };
  }, i = async (d) => {
    const { opts: n, url: p } = await c(d), j = {
      redirect: "follow",
      ...n,
      body: Ge(n)
    };
    let P = new Request(p, j);
    for (const f of a.request.fns)
      f && (P = await f(P, n));
    const R = n.fetch;
    let u = await R(P);
    for (const f of a.response.fns)
      f && (u = await f(u, P, n));
    const g = {
      request: P,
      response: u
    };
    if (u.ok) {
      const f = (n.parseAs === "auto" ? Ke(u.headers.get("Content-Type")) : n.parseAs) ?? "json";
      if (u.status === 204 || u.headers.get("Content-Length") === "0") {
        let w;
        switch (f) {
          case "arrayBuffer":
          case "blob":
          case "text":
            w = await u[f]();
            break;
          case "formData":
            w = new FormData();
            break;
          case "stream":
            w = u.body;
            break;
          case "json":
          default:
            w = {};
            break;
        }
        return n.responseStyle === "data" ? w : {
          data: w,
          ...g
        };
      }
      let y;
      switch (f) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          y = await u[f]();
          break;
        case "stream":
          return n.responseStyle === "data" ? u.body : {
            data: u.body,
            ...g
          };
      }
      return f === "json" && (n.responseValidator && await n.responseValidator(y), n.responseTransformer && (y = await n.responseTransformer(y))), n.responseStyle === "data" ? y : {
        data: y,
        ...g
      };
    }
    const S = await u.text();
    let q;
    try {
      q = JSON.parse(S);
    } catch {
    }
    const A = q ?? S;
    let v = A;
    for (const f of a.error.fns)
      f && (v = await f(A, u, P, n));
    if (v = v || {}, n.throwOnError)
      throw v;
    return n.responseStyle === "data" ? void 0 : {
      error: v,
      ...g
    };
  }, o = (d) => (n) => i({ ...n, method: d }), l = (d) => async (n) => {
    const { opts: p, url: j } = await c(n);
    return Re({
      ...p,
      body: p.body,
      headers: p.headers,
      method: d,
      onRequest: async (P, R) => {
        let u = new Request(P, R);
        for (const g of a.request.fns)
          g && (u = await g(u, p));
        return u;
      },
      url: j
    });
  };
  return {
    buildUrl: oe,
    connect: o("CONNECT"),
    delete: o("DELETE"),
    get: o("GET"),
    getConfig: r,
    head: o("HEAD"),
    interceptors: a,
    options: o("OPTIONS"),
    patch: o("PATCH"),
    post: o("POST"),
    put: o("PUT"),
    request: i,
    setConfig: s,
    sse: {
      connect: l("CONNECT"),
      delete: l("DELETE"),
      get: l("GET"),
      head: l("HEAD"),
      options: l("OPTIONS"),
      patch: l("PATCH"),
      post: l("POST"),
      put: l("PUT"),
      trace: l("TRACE")
    },
    trace: o("TRACE")
  };
}, Y = rt(Pe()), st = (e) => ((e == null ? void 0 : e.client) ?? Y).get({
  security: [
    {
      scheme: "bearer",
      type: "http"
    }
  ],
  url: "/umbraco/element-finder/api/v1/all-types",
  ...e
}), at = (e) => (e.client ?? Y).get({
  security: [
    {
      scheme: "bearer",
      type: "http"
    }
  ],
  url: "/umbraco/element-finder/api/v1/usage/{alias}",
  ...e
});
class nt {
  async getElementInfo(t) {
    return (await at({
      path: {
        alias: t
      },
      throwOnError: !0
    })).data;
  }
  async getAllDocumentTypes() {
    return (await st({
      throwOnError: !0
    })).data;
  }
}
var U;
class ce extends je {
  constructor(r) {
    super(r);
    ne(this, U);
    ie(this, U, new nt()), this.provideContext(F, this);
  }
  async getInfoFromAlias(r) {
    return H(this, U).getElementInfo(r);
  }
  async getAllElementTypes() {
    return H(this, U).getAllDocumentTypes();
  }
}
U = new WeakMap();
const F = new qe("GetInfoContext"), it = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET_INFO_CONTEXT_TOKEN: F,
  GetInfoContext: ce,
  default: ce
}, Symbol.toStringTag, { value: "Module" }));
var ot = Object.defineProperty, lt = Object.getOwnPropertyDescriptor, xe = (e) => {
  throw TypeError(e);
}, N = (e, t, r, s) => {
  for (var a = s > 1 ? void 0 : s ? lt(t, r) : t, c = e.length - 1, i; c >= 0; c--)
    (i = e[c]) && (a = (s ? i(t, r, a) : i(a)) || a);
  return s && a && ot(t, r, a), a;
}, $e = (e, t, r) => t.has(e) || xe("Cannot " + r), I = (e, t, r) => ($e(e, t, "read from private field"), r ? r.call(e) : t.get(e)), ue = (e, t, r) => t.has(e) ? xe("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Te = (e, t, r, s) => ($e(e, t, "write to private field"), t.set(e, r), r), de = (e, t, r, s) => ({
  set _(a) {
    Te(e, t, a);
  },
  get _() {
    return I(e, t, s);
  }
}), B, k;
const J = 10;
let T = class extends ge(he) {
  constructor() {
    super(), this._nodes = [], this._contentTypeLabel = "Document Type", this._loading = !1, this._error = null, this._currentPage = 1, ue(this, B), ue(this, k, 0), this.consumeContext(F, (e) => {
      e && Te(this, B, e);
    }), this.consumeContext(Ne, (e) => {
      e && this.observe(e.data, async (t) => {
        const r = ++de(this, k)._;
        if (this._nodes = [], this._currentPage = 1, this._error = null, this._loading = !1, !(!(t != null && t.alias) || !I(this, B))) {
          this._contentTypeLabel = t != null && t.isElement ? "Element Type" : "Document Type", this._loading = !0;
          try {
            const s = await I(this, B).getInfoFromAlias(t.alias);
            if (r !== I(this, k)) return;
            this._nodes = (s == null ? void 0 : s.usages) ?? [];
          } catch (s) {
            if (r !== I(this, k)) return;
            console.error(s), this._error = "Error fetching usage", this._nodes = [];
          } finally {
            r === I(this, k) && (this._loading = !1);
          }
        }
      });
    }), this._modalRegistration = new me(
      this,
      _e
    ).addAdditionalPath(M).onSetup(() => ({
      data: { entityType: M },
      modal: { size: "large" }
    }));
  }
  disconnectedCallback() {
    ++de(this, k)._, super.disconnectedCallback();
  }
  get pagedNodes() {
    const e = (this._currentPage - 1) * J;
    return this._nodes.slice(e, e + J);
  }
  totalPages() {
    return Math.ceil(this._nodes.length / J);
  }
  nextPage() {
    this._currentPage < this.totalPages() && this._currentPage++;
  }
  prevPage() {
    this._currentPage > 1 && this._currentPage--;
  }
  _openEditModal(e) {
    const t = ye.generateLocal({
      unique: e
    });
    this._modalRegistration.open({}, t);
  }
  _instanceLabel(e) {
    return e === 1 ? "instance" : "instances";
  }
  render() {
    return this._loading ? h`<uui-loader></uui-loader>` : this._error ? h`<uui-box>
        <uui-tag look="danger">${this._error}</uui-tag>
      </uui-box>` : h`
      <uui-box>
        <div slot="header">
          <strong>
            Found ${this._nodes.length} ${this._instanceLabel(this._nodes.length)} of this
            ${this._contentTypeLabel}${this._nodes.length > 0 ? ":" : ""}
          </strong>
        </div>

        ${this._nodes.length > 0 ? h`
              <div class="usage-list">
                ${this.pagedNodes.map(
      (e, t) => h`
                    <div class="usage-item">
                      <span class="page-name">${e.pageName}</span>
                      <div class="actions">
                        <uui-button
                          look="secondary"
                          label="Edit"
                          @click=${() => this._openEditModal(e.id)}
                        ></uui-button>
                        <uui-button
                          look="secondary"
                          label="View"
                          @click=${() => window.open(e.url, "_blank")}
                        ></uui-button>
                      </div>
                    </div>
                    ${t < this.pagedNodes.length - 1 ? h`<hr class="divider" />` : null}
                  `
    )}
              </div>

              <!-- Pagination -->
              ${this.totalPages() > 1 ? h`
                    <div class="pagination">
                      <uui-button
                        label="Previous"
                        ?disabled=${this._currentPage === 1}
                        @click=${this.prevPage}
                      ></uui-button>
                      <span
                        >Page ${this._currentPage} of ${this.totalPages()}</span
                      >
                      <uui-button
                        label="Next"
                        ?disabled=${this._currentPage === this.totalPages()}
                        @click=${this.nextPage}
                      ></uui-button>
                    </div>
                  ` : null}
            ` : h`
              <uui-state-message>
                No content nodes are currently using this ${this._contentTypeLabel}.
              </uui-state-message>
            `}
      </uui-box>
    `;
  }
};
B = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
T.styles = pe`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    uui-box {
      max-width: 800px;
      margin: 0 auto;
    }

    .usage-list {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-1);
    }

    .usage-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--uui-size-2) 0;
    }

    .page-name {
      font-weight: 500;
    }

    .divider {
      border: none;
      border-bottom: 1px solid var(--uui-color-border);
      margin: 0;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--uui-size-2);
    }
  `;
N([
  _()
], T.prototype, "_nodes", 2);
N([
  _()
], T.prototype, "_contentTypeLabel", 2);
N([
  _()
], T.prototype, "_loading", 2);
N([
  _()
], T.prototype, "_error", 2);
N([
  _()
], T.prototype, "_currentPage", 2);
T = N([
  fe("element-finder")
], T);
var ct = Object.defineProperty, ut = Object.getOwnPropertyDescriptor, Se = (e) => {
  throw TypeError(e);
}, x = (e, t, r, s) => {
  for (var a = s > 1 ? void 0 : s ? ut(t, r) : t, c = e.length - 1, i; c >= 0; c--)
    (i = e[c]) && (a = (s ? i(t, r, a) : i(a)) || a);
  return s && a && ct(t, r, a), a;
}, Ae = (e, t, r) => t.has(e) || Se("Cannot " + r), E = (e, t, r) => (Ae(e, t, "read from private field"), r ? r.call(e) : t.get(e)), K = (e, t, r) => t.has(e) ? Se("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Ce = (e, t, r, s) => (Ae(e, t, "write to private field"), t.set(e, r), r), D = (e, t, r, s) => ({
  set _(a) {
    Ce(e, t, a);
  },
  get _() {
    return E(e, t, s);
  }
}), O, $, z;
const X = 10, dt = {
  document: "Document Types",
  element: "Element Types"
};
let b = class extends ge(
  he
) {
  constructor() {
    super(), this._nodes = [], this._loading = !1, this._hasSearched = !1, this._error = null, this._typesError = null, this._currentPage = 1, this._selectedAlias = "", this._docTypes = [], K(this, O), K(this, $, 0), K(this, z, 0), this.consumeContext(F, (e) => {
      Ce(this, O, e), this._loadDocTypes();
    }), this._modalRegistration = new me(
      this,
      _e
    ).addAdditionalPath(M).onSetup(() => ({
      data: { entityType: M },
      modal: { size: "large" }
    }));
  }
  async _loadDocTypes() {
    const e = ++D(this, z)._;
    if (E(this, O)) {
      this._typesError = null;
      try {
        const t = await E(this, O).getAllElementTypes();
        if (e !== E(this, z)) return;
        this._docTypes = t;
      } catch (t) {
        if (e !== E(this, z)) return;
        console.error(t), this._typesError = "Error fetching document types", this._docTypes = [];
      }
    }
  }
  async _handleSearch() {
    if (!this._selectedAlias || !E(this, O)) return;
    const e = ++D(this, $)._;
    this._loading = !0, this._error = null;
    try {
      const t = await E(this, O).getInfoFromAlias(
        this._selectedAlias
      );
      if (e !== E(this, $)) return;
      this._nodes = (t == null ? void 0 : t.usages) ?? [], this._currentPage = 1, this._hasSearched = !0;
    } catch (t) {
      if (e !== E(this, $)) return;
      console.error(t), this._error = "Error fetching usage", this._nodes = [];
    } finally {
      e === E(this, $) && (this._loading = !1);
    }
  }
  _onSelectChange(e) {
    if (!(e.currentTarget instanceof De)) return;
    const t = e.currentTarget.value;
    if (typeof t != "string") {
      console.error("Expected a document type alias from the type selector");
      return;
    }
    this._selectedAlias !== t && (++D(this, $)._, this._selectedAlias = t, this._nodes = [], this._currentPage = 1, this._error = null, this._loading = !1, this._hasSearched = !1);
  }
  disconnectedCallback() {
    ++D(this, $)._, ++D(this, z)._, super.disconnectedCallback();
  }
  get pagedNodes() {
    const e = (this._currentPage - 1) * X;
    return this._nodes.slice(e, e + X);
  }
  totalPages() {
    return Math.ceil(this._nodes.length / X);
  }
  nextPage() {
    this._currentPage < this.totalPages() && this._currentPage++;
  }
  prevPage() {
    this._currentPage > 1 && this._currentPage--;
  }
  _openEditModal(e) {
    const t = ye.generateLocal({
      unique: e
    });
    this._modalRegistration.open({}, t);
  }
  _getGroupLabel(e) {
    return dt[e] ?? "Other Types";
  }
  render() {
    return h`
      <uui-box headline="Element Finder">
        <div class="search-container">
          <uui-select
            .options=${this._docTypes.map((e) => ({
      name: e.name,
      value: e.alias,
      group: this._getGroupLabel(e.kind),
      selected: this._selectedAlias === e.alias
    }))}
            label="Element Finder"
            @change=${this._onSelectChange}
            placeholder="Select a type"
          >
          </uui-select>
          <uui-button
            look="primary"
            label="Find Usage"
            .disabled=${!this._selectedAlias || this._loading || this._typesError !== null}
            @click=${this._handleSearch}
          >
            Find Usage
          </uui-button>
        </div>

        ${this._loading ? h`<uui-loader></uui-loader>` : this._renderResults()}
      </uui-box>
    `;
  }
  _instanceLabel(e) {
    return e === 1 ? "instance" : "instances";
  }
  _renderResults() {
    return this._typesError ? h`<uui-tag look="danger">${this._typesError}</uui-tag>` : this._error ? h`<uui-tag look="danger">${this._error}</uui-tag>` : this._hasSearched ? h`
      <div class="results-header">
        Found ${this._nodes.length} ${this._instanceLabel(this._nodes.length)}${this._nodes.length > 0 ? ":" : ""}
      </div>
      <div class="usage-list">
        ${this.pagedNodes.map(
      (e, t) => h`
            <div class="usage-item">
              <span class="page-name">${e.pageName}</span>
              <div class="actions">
                <uui-button
                  look="secondary"
                  label="Edit"
                  @click=${() => this._openEditModal(e.id)}
                ></uui-button>
                <uui-button
                  look="secondary"
                  label="View"
                  @click=${() => window.open(e.url, "_blank")}
                ></uui-button>
              </div>
            </div>
            ${t < this.pagedNodes.length - 1 ? h`<hr class="divider" />` : ""}
          `
    )}
      </div>
      ${this._renderPagination()}
    ` : h`<uui-state-message
        >Select a type and click search to see results.</uui-state-message
      >`;
  }
  _renderPagination() {
    return this.totalPages() <= 1 ? null : h`
      <div class="pagination">
        <uui-button
          label="Previous"
          ?disabled=${this._currentPage === 1}
          @click=${this.prevPage}
          >Previous</uui-button
        >
        <span>Page ${this._currentPage} of ${this.totalPages()}</span>
        <uui-button
          label="Next"
          ?disabled=${this._currentPage === this.totalPages()}
          @click=${this.nextPage}
          >Next</uui-button
        >
      </div>
    `;
  }
};
O = /* @__PURE__ */ new WeakMap();
$ = /* @__PURE__ */ new WeakMap();
z = /* @__PURE__ */ new WeakMap();
b.styles = pe`
    :host {
      display: block;
      padding: 24px;
    }
    uui-box {
      max-width: 800px;
      margin: 0 auto;
    }
    .search-container {
      display: flex;
      gap: 10px;
      margin-bottom: 24px;
    }
    uui-select {
      flex-grow: 1;
    }
    .usage-list {
      display: flex;
      flex-direction: column;
    }
    .usage-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
    }
    .divider {
      border: none;
      border-bottom: 1px solid var(--uui-color-border);
      margin: 0;
    }
    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20px;
    }
    .results-header {
      font-weight: bold;
      margin-bottom: 10px;
    }
  `;
x([
  _()
], b.prototype, "_nodes", 2);
x([
  _()
], b.prototype, "_loading", 2);
x([
  _()
], b.prototype, "_hasSearched", 2);
x([
  _()
], b.prototype, "_error", 2);
x([
  _()
], b.prototype, "_typesError", 2);
x([
  _()
], b.prototype, "_currentPage", 2);
x([
  _()
], b.prototype, "_selectedAlias", 2);
x([
  _()
], b.prototype, "_docTypes", 2);
b = x([
  fe("element-finder-dashboard")
], b);
const ht = [
  {
    type: "workspaceView",
    name: "Element Finder",
    alias: "element-finder",
    elementName: "element-finder",
    weight: -1,
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "Umb.Workspace.DocumentType"
      }
    ],
    meta: {
      label: "Usage",
      icon: "icon-search",
      pathname: "element-finder"
    }
  }
], pt = [...ht], ft = [
  {
    type: "globalContext",
    alias: "getInfo.context",
    name: "Get Info context",
    js: () => Promise.resolve().then(() => it)
  }
], gt = [...ft], _t = [
  {
    type: "dashboard",
    name: "Element Finder",
    alias: "element-finder-dashboard",
    elementName: "element-finder-dashboard",
    weight: -1,
    meta: {
      label: "Element Finder",
      pathname: "element-finder-dashboard"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content"
      }
    ]
  }
], yt = [..._t], mt = [
  ...pt,
  ...gt,
  ...yt
], It = (e, t) => {
  e.consumeContext(Ue, async (r) => {
    const s = r == null ? void 0 : r.getOpenApiConfiguration();
    Y.setConfig({
      auth: (s == null ? void 0 : s.token) ?? void 0,
      baseUrl: (s == null ? void 0 : s.base) ?? "",
      credentials: (s == null ? void 0 : s.credentials) ?? "same-origin"
    });
  }), t.registerMany(mt);
};
export {
  It as onInit
};
//# sourceMappingURL=element-finder.js.map
