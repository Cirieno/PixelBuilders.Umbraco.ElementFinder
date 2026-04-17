var Y = (e) => {
  throw TypeError(e);
};
var Q = (e, t, r) => t.has(e) || Y("Cannot " + r);
var M = (e, t, r) => (Q(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Z = (e, t, r) => t.has(e) ? Y("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), ee = (e, t, r, s) => (Q(e, t, "write to private field"), s ? s.call(e, r) : t.set(e, r), r);
import "@umbraco-cms/backoffice/extension-api";
import { UMB_AUTH_CONTEXT as Ee } from "@umbraco-cms/backoffice/auth";
import { LitElement as ne, html as f, css as ie, state as v, customElement as oe } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as le } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT as Te, UMB_WORKSPACE_MODAL as ce } from "@umbraco-cms/backoffice/workspace";
import { UMB_DOCUMENT_ENTITY_TYPE as D, UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN as ue } from "@umbraco-cms/backoffice/document";
import { UmbControllerBase as Ae } from "@umbraco-cms/backoffice/class-api";
import "@umbraco-cms/backoffice/controller-api";
import { UmbContextToken as Se } from "@umbraco-cms/backoffice/context-api";
import { UmbModalRouteRegistrationController as de } from "@umbraco-cms/backoffice/router";
import "@umbraco-cms/backoffice/extension-registry";
const Ce = {
  bodySerializer: (e) => JSON.stringify(
    e,
    (t, r) => typeof r == "bigint" ? r.toString() : r
  )
}, Oe = ({
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
  let h;
  const O = l ?? ((u) => new Promise((g) => setTimeout(g, u)));
  return { stream: async function* () {
    let u = c ?? 3e3, g = 0;
    const x = n.signal ?? new AbortController().signal;
    for (; !x.aborted; ) {
      g++;
      const k = n.headers instanceof Headers ? n.headers : new Headers(n.headers);
      h !== void 0 && k.set("Last-Event-ID", h);
      try {
        const $ = {
          redirect: "follow",
          ...n,
          body: n.serializedBody,
          headers: k,
          signal: x
        };
        let b = new Request(d, $);
        e && (b = await e(d, $));
        const m = await (n.fetch ?? globalThis.fetch)(b);
        if (!m.ok)
          throw new Error(
            `SSE failed: ${m.status} ${m.statusText}`
          );
        if (!m.body) throw new Error("No body in SSE response");
        const _ = m.body.pipeThrough(new TextDecoderStream()).getReader();
        let R = "";
        const H = () => {
          try {
            _.cancel();
          } catch {
          }
        };
        x.addEventListener("abort", H);
        try {
          for (; ; ) {
            const { done: we, value: Pe } = await _.read();
            if (we) break;
            R += Pe;
            const G = R.split(`

`);
            R = G.pop() ?? "";
            for (const xe of G) {
              const $e = xe.split(`
`), j = [];
              let J;
              for (const y of $e)
                if (y.startsWith("data:"))
                  j.push(y.replace(/^data:\s*/, ""));
                else if (y.startsWith("event:"))
                  J = y.replace(/^event:\s*/, "");
                else if (y.startsWith("id:"))
                  h = y.replace(/^id:\s*/, "");
                else if (y.startsWith("retry:")) {
                  const X = Number.parseInt(
                    y.replace(/^retry:\s*/, ""),
                    10
                  );
                  Number.isNaN(X) || (u = X);
                }
              let E, K = !1;
              if (j.length) {
                const y = j.join(`
`);
                try {
                  E = JSON.parse(y), K = !0;
                } catch {
                  E = y;
                }
              }
              K && (a && await a(E), s && (E = await s(E))), r == null || r({
                data: E,
                event: J,
                id: h,
                retry: u
              }), j.length && (yield E);
            }
          }
        } finally {
          x.removeEventListener("abort", H), _.releaseLock();
        }
        break;
      } catch ($) {
        if (t == null || t($), i !== void 0 && g >= i)
          break;
        const b = Math.min(
          u * 2 ** (g - 1),
          o ?? 3e4
        );
        await O(b);
      }
    }
  }() };
}, ke = (e) => {
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
}, Ie = (e) => {
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
}, ze = (e) => {
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
}, he = ({
  allowReserved: e,
  explode: t,
  name: r,
  style: s,
  value: a
}) => {
  if (!t) {
    const o = (e ? a : a.map((l) => encodeURIComponent(l))).join(Ie(s));
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
  const c = ke(s), i = a.map((o) => s === "label" || s === "simple" ? e ? o : encodeURIComponent(o) : q({
    allowReserved: e,
    name: r,
    value: o
  })).join(c);
  return s === "label" || s === "matrix" ? c + i : i;
}, q = ({
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
}, fe = ({
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
    Object.entries(a).forEach(([n, h]) => {
      l = [
        ...l,
        n,
        e ? h : encodeURIComponent(h)
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
  const i = ze(s), o = Object.entries(a).map(
    ([l, d]) => q({
      allowReserved: e,
      name: s === "deepObject" ? `${r}[${l}]` : l,
      value: d
    })
  ).join(i);
  return s === "label" || s === "matrix" ? i + o : o;
}, Ue = /\{[^{}]+\}/g, je = ({ path: e, url: t }) => {
  let r = t;
  const s = t.match(Ue);
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
          he({ explode: c, name: i, style: o, value: l })
        );
        continue;
      }
      if (typeof l == "object") {
        r = r.replace(
          a,
          fe({
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
          `;${q({
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
}, Ne = ({
  baseUrl: e,
  path: t,
  query: r,
  querySerializer: s,
  url: a
}) => {
  const c = a.startsWith("/") ? a : `/${a}`;
  let i = (e ?? "") + c;
  t && (i = je({ path: t, url: i }));
  let o = r ? s(r) : "";
  return o.startsWith("?") && (o = o.substring(1)), o && (i += `?${o}`), i;
};
function De(e) {
  const t = e.body !== void 0;
  if (t && e.bodySerializer)
    return "serializedBody" in e ? e.serializedBody !== void 0 && e.serializedBody !== "" ? e.serializedBody : null : e.body !== "" ? e.body : null;
  if (t)
    return e.body;
}
const qe = async (e, t) => {
  const r = typeof t == "function" ? await t(e) : t;
  if (r)
    return e.scheme === "bearer" ? `Bearer ${r}` : e.scheme === "basic" ? `Basic ${btoa(r)}` : r;
}, pe = ({
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
          const l = he({
            allowReserved: e,
            explode: !0,
            name: i,
            style: "form",
            value: o,
            ...t
          });
          l && c.push(l);
        } else if (typeof o == "object") {
          const l = fe({
            allowReserved: e,
            explode: !0,
            name: i,
            style: "deepObject",
            value: o,
            ...r
          });
          l && c.push(l);
        } else {
          const l = q({
            allowReserved: e,
            name: i,
            value: o
          });
          l && c.push(l);
        }
    }
  return c.join("&");
}, Be = (e) => {
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
}, Re = (e, t) => {
  var r, s;
  return t ? !!(e.headers.has(t) || (r = e.query) != null && r[t] || (s = e.headers.get("Cookie")) != null && s.includes(`${t}=`)) : !1;
}, Me = async ({
  security: e,
  ...t
}) => {
  for (const r of e) {
    if (Re(t, r.name))
      continue;
    const s = await qe(r, t.auth);
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
}, te = (e) => Ne({
  baseUrl: e.baseUrl,
  path: e.path,
  query: e.query,
  querySerializer: typeof e.querySerializer == "function" ? e.querySerializer : pe(e.querySerializer),
  url: e.url
}), re = (e, t) => {
  var s;
  const r = { ...e, ...t };
  return (s = r.baseUrl) != null && s.endsWith("/") && (r.baseUrl = r.baseUrl.substring(0, r.baseUrl.length - 1)), r.headers = ge(e.headers, t.headers), r;
}, We = (e) => {
  const t = [];
  return e.forEach((r, s) => {
    t.push([s, r]);
  }), t;
}, ge = (...e) => {
  const t = new Headers();
  for (const r of e) {
    if (!r)
      continue;
    const s = r instanceof Headers ? We(r) : Object.entries(r);
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
class W {
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
const Fe = () => ({
  error: new W(),
  request: new W(),
  response: new W()
}), Le = pe({
  allowReserved: !1,
  array: {
    explode: !0,
    style: "form"
  },
  object: {
    explode: !0,
    style: "deepObject"
  }
}), Ve = {
  "Content-Type": "application/json"
}, me = (e = {}) => ({
  ...Ce,
  headers: Ve,
  parseAs: "auto",
  querySerializer: Le,
  ...e
}), He = (e = {}) => {
  let t = re(me(), e);
  const r = () => ({ ...t }), s = (d) => (t = re(t, d), r()), a = Fe(), c = async (d) => {
    const n = {
      ...t,
      ...d,
      fetch: d.fetch ?? t.fetch ?? globalThis.fetch,
      headers: ge(t.headers, d.headers),
      serializedBody: void 0
    };
    n.security && await Me({
      ...n,
      security: n.security
    }), n.requestValidator && await n.requestValidator(n), n.body !== void 0 && n.bodySerializer && (n.serializedBody = n.bodySerializer(n.body)), (n.body === void 0 || n.serializedBody === "") && n.headers.delete("Content-Type");
    const h = te(n);
    return { opts: n, url: h };
  }, i = async (d) => {
    const { opts: n, url: h } = await c(d), O = {
      redirect: "follow",
      ...n,
      body: De(n)
    };
    let w = new Request(h, O);
    for (const p of a.request.fns)
      p && (w = await p(w, n));
    const U = n.fetch;
    let u = await U(w);
    for (const p of a.response.fns)
      p && (u = await p(u, w, n));
    const g = {
      request: w,
      response: u
    };
    if (u.ok) {
      const p = (n.parseAs === "auto" ? Be(u.headers.get("Content-Type")) : n.parseAs) ?? "json";
      if (u.status === 204 || u.headers.get("Content-Length") === "0") {
        let _;
        switch (p) {
          case "arrayBuffer":
          case "blob":
          case "text":
            _ = await u[p]();
            break;
          case "formData":
            _ = new FormData();
            break;
          case "stream":
            _ = u.body;
            break;
          case "json":
          default:
            _ = {};
            break;
        }
        return n.responseStyle === "data" ? _ : {
          data: _,
          ...g
        };
      }
      let m;
      switch (p) {
        case "arrayBuffer":
        case "blob":
        case "formData":
        case "json":
        case "text":
          m = await u[p]();
          break;
        case "stream":
          return n.responseStyle === "data" ? u.body : {
            data: u.body,
            ...g
          };
      }
      return p === "json" && (n.responseValidator && await n.responseValidator(m), n.responseTransformer && (m = await n.responseTransformer(m))), n.responseStyle === "data" ? m : {
        data: m,
        ...g
      };
    }
    const x = await u.text();
    let k;
    try {
      k = JSON.parse(x);
    } catch {
    }
    const $ = k ?? x;
    let b = $;
    for (const p of a.error.fns)
      p && (b = await p($, u, w, n));
    if (b = b || {}, n.throwOnError)
      throw b;
    return n.responseStyle === "data" ? void 0 : {
      error: b,
      ...g
    };
  }, o = (d) => (n) => i({ ...n, method: d }), l = (d) => async (n) => {
    const { opts: h, url: O } = await c(n);
    return Oe({
      ...h,
      body: h.body,
      headers: h.headers,
      method: d,
      onRequest: async (w, U) => {
        let u = new Request(w, U);
        for (const g of a.request.fns)
          g && (u = await g(u, h));
        return u;
      },
      url: O
    });
  };
  return {
    buildUrl: te,
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
}, V = He(me()), Ge = (e) => ((e == null ? void 0 : e.client) ?? V).get({
  security: [
    {
      scheme: "bearer",
      type: "http"
    }
  ],
  url: "/umbraco/element-finder/api/v1/all-types",
  ...e
}), Je = (e) => (e.client ?? V).get({
  security: [
    {
      scheme: "bearer",
      type: "http"
    }
  ],
  url: "/umbraco/element-finder/api/v1/usage/{alias}",
  ...e
});
class Ke {
  async getElementInfo(t) {
    try {
      return (await Je({
        path: {
          alias: t
        }
      })).data ?? null;
    } catch {
      return null;
    }
  }
  async getAllDocumentTypes() {
    try {
      return (await Ge()).data ?? [];
    } catch (t) {
      return console.error("Failed to fetch document types:", t), [];
    }
  }
}
var C;
class se extends Ae {
  constructor(r) {
    super(r);
    Z(this, C);
    ee(this, C, new Ke()), this.provideContext(B, this);
  }
  async getInfoFromAlias(r) {
    return M(this, C).getElementInfo(r);
  }
  async getAllElementTypes() {
    return M(this, C).getAllDocumentTypes();
  }
}
C = new WeakMap();
const B = new Se("GetInfoContext"), Xe = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET_INFO_CONTEXT_TOKEN: B,
  GetInfoContext: se,
  default: se
}, Symbol.toStringTag, { value: "Module" }));
var Ye = Object.defineProperty, Qe = Object.getOwnPropertyDescriptor, ye = (e) => {
  throw TypeError(e);
}, z = (e, t, r, s) => {
  for (var a = s > 1 ? void 0 : s ? Qe(t, r) : t, c = e.length - 1, i; c >= 0; c--)
    (i = e[c]) && (a = (s ? i(t, r, a) : i(a)) || a);
  return s && a && Ye(t, r, a), a;
}, be = (e, t, r) => t.has(e) || ye("Cannot " + r), ae = (e, t, r) => (be(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Ze = (e, t, r) => t.has(e) ? ye("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), et = (e, t, r, s) => (be(e, t, "write to private field"), t.set(e, r), r), I;
const F = 10;
let A = class extends le(ne) {
  constructor() {
    super(), this._nodes = [], this._loading = !1, this._error = null, this._currentPage = 1, Ze(this, I), this.consumeContext(B, (e) => {
      e && et(this, I, e);
    }), this.consumeContext(Te, (e) => {
      e && this.observe(e.data, async (t) => {
        var r;
        if (!(!(t != null && t.alias) || !ae(this, I))) {
          this._loading = !0, this._error = null;
          try {
            const s = await ae(this, I).getInfoFromAlias(t.alias);
            (r = s == null ? void 0 : s.usages) != null && r.length ? (this._nodes = s.usages, this._currentPage = 1) : this._nodes = [];
          } catch (s) {
            console.error(s), this._error = "Error fetching usage", this._nodes = [];
          } finally {
            this._loading = !1;
          }
        }
      });
    }), this._modalRegistration = new de(
      this,
      ce
    ).addAdditionalPath(D).onSetup(() => ({
      data: { entityType: D },
      modal: { size: "large" }
    }));
  }
  get pagedNodes() {
    const e = (this._currentPage - 1) * F;
    return this._nodes.slice(e, e + F);
  }
  totalPages() {
    return Math.ceil(this._nodes.length / F);
  }
  nextPage() {
    this._currentPage < this.totalPages() && this._currentPage++;
  }
  prevPage() {
    this._currentPage > 1 && this._currentPage--;
  }
  _openEditModal(e) {
    const t = ue.generateLocal({
      unique: e
    });
    this._modalRegistration.open({}, t);
  }
  _instanceLabel(e) {
    return e === 1 ? "instance" : "instances";
  }
  render() {
    return this._loading ? f`<uui-loader></uui-loader>` : f`
      <uui-box headline="Content Usage">
        <div slot="header">
          Found ${this._nodes.length} ${this._instanceLabel(this._nodes.length)} of
          this type.
        </div>

        ${this._error ? f`<uui-tag look="danger">${this._error}</uui-tag>` : ""}
        ${this._nodes.length > 0 ? f`
              <div class="usage-list">
                ${this.pagedNodes.map(
      (e, t) => f`
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
                    ${t < this.pagedNodes.length - 1 ? f`<hr class="divider" />` : null}
                  `
    )}
              </div>

              <!-- Pagination -->
              ${this.totalPages() > 1 ? f`
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
            ` : f`
              <uui-state-message>
                No content nodes are currently using this Document Type.
              </uui-state-message>
            `}
      </uui-box>
    `;
  }
};
I = /* @__PURE__ */ new WeakMap();
A.styles = ie`
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
z([
  v()
], A.prototype, "_nodes", 2);
z([
  v()
], A.prototype, "_loading", 2);
z([
  v()
], A.prototype, "_error", 2);
z([
  v()
], A.prototype, "_currentPage", 2);
A = z([
  oe("element-finder")
], A);
var tt = Object.defineProperty, rt = Object.getOwnPropertyDescriptor, _e = (e) => {
  throw TypeError(e);
}, S = (e, t, r, s) => {
  for (var a = s > 1 ? void 0 : s ? rt(t, r) : t, c = e.length - 1, i; c >= 0; c--)
    (i = e[c]) && (a = (s ? i(t, r, a) : i(a)) || a);
  return s && a && tt(t, r, a), a;
}, ve = (e, t, r) => t.has(e) || _e("Cannot " + r), N = (e, t, r) => (ve(e, t, "read from private field"), t.get(e)), st = (e, t, r) => t.has(e) ? _e("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), at = (e, t, r, s) => (ve(e, t, "write to private field"), t.set(e, r), r), T;
const L = 10, nt = {
  document: "Document Types",
  element: "Element Types"
};
let P = class extends le(
  ne
) {
  constructor() {
    super(), this._nodes = [], this._loading = !1, this._error = null, this._currentPage = 1, this._selectedAlias = "", this._docTypes = [], st(this, T), this.consumeContext(B, (e) => {
      at(this, T, e), this._loadDocTypes();
    }), this._modalRegistration = new de(
      this,
      ce
    ).addAdditionalPath(D).onSetup(() => ({
      data: { entityType: D },
      modal: { size: "large" }
    }));
  }
  async _loadDocTypes() {
    N(this, T) && (this._docTypes = await N(this, T).getAllElementTypes());
  }
  async _handleSearch() {
    if (!(!this._selectedAlias || !N(this, T))) {
      this._loading = !0, this._error = null;
      try {
        const e = await N(this, T).getInfoFromAlias(
          this._selectedAlias
        );
        this._nodes = (e == null ? void 0 : e.usages) ?? [], this._currentPage = 1;
      } catch {
        this._error = "Error fetching usage", this._nodes = [];
      } finally {
        this._loading = !1;
      }
    }
  }
  _onSelectChange(e) {
    this._selectedAlias = e.target.value;
  }
  get pagedNodes() {
    const e = (this._currentPage - 1) * L;
    return this._nodes.slice(e, e + L);
  }
  totalPages() {
    return Math.ceil(this._nodes.length / L);
  }
  nextPage() {
    this._currentPage < this.totalPages() && this._currentPage++;
  }
  prevPage() {
    this._currentPage > 1 && this._currentPage--;
  }
  _openEditModal(e) {
    const t = ue.generateLocal({
      unique: e
    });
    this._modalRegistration.open({}, t);
  }
  _getGroupLabel(e) {
    return nt[e] ?? "Other Types";
  }
  render() {
    return f`
      <uui-box headline="Element Finder">
        <div class="search-container">
          <uui-select
            .options=${this._docTypes.map((e) => ({
      name: e.name,
      value: e.alias,
      group: this._getGroupLabel(e.kind),
      selected: this._selectedAlias === e.alias
    }))}
            @change=${this._onSelectChange}
            placeholder="Select a type"
          >
          </uui-select>
          <uui-button
            look="primary"
            label="Find Usage"
            .disabled=${!this._selectedAlias || this._loading}
            @click=${this._handleSearch}
          >
            Find Usage
          </uui-button>
        </div>

        ${this._loading ? f`<uui-loader></uui-loader>` : this._renderResults()}
      </uui-box>
    `;
  }
  _instanceLabel(e) {
    return e === 1 ? "instance" : "instances";
  }
  _renderResults() {
    return this._error ? f`<uui-tag look="danger">${this._error}</uui-tag>` : this._nodes.length === 0 ? f`<uui-state-message
        >Select a type and click search to see results.</uui-state-message
      >` : f`
      <div class="results-header">
        Found ${this._nodes.length} ${this._instanceLabel(this._nodes.length)}.
      </div>
      <div class="usage-list">
        ${this.pagedNodes.map(
      (e, t) => f`
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
            ${t < this.pagedNodes.length - 1 ? f`<hr class="divider" />` : ""}
          `
    )}
      </div>
      ${this._renderPagination()}
    `;
  }
  _renderPagination() {
    return this.totalPages() <= 1 ? null : f`
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
T = /* @__PURE__ */ new WeakMap();
P.styles = ie`
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
S([
  v()
], P.prototype, "_nodes", 2);
S([
  v()
], P.prototype, "_loading", 2);
S([
  v()
], P.prototype, "_error", 2);
S([
  v()
], P.prototype, "_currentPage", 2);
S([
  v()
], P.prototype, "_selectedAlias", 2);
S([
  v()
], P.prototype, "_docTypes", 2);
P = S([
  oe("element-finder-dashboard")
], P);
const it = [
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
], ot = [...it], lt = [
  {
    type: "globalContext",
    alias: "getInfo.context",
    name: "Get Info context",
    js: () => Promise.resolve().then(() => Xe)
  }
], ct = [...lt], ut = [
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
], dt = [...ut], ht = [
  ...ot,
  ...ct,
  ...dt
], Et = (e, t) => {
  e.consumeContext(Ee, async (r) => {
    const s = r == null ? void 0 : r.getOpenApiConfiguration();
    V.setConfig({
      auth: (s == null ? void 0 : s.token) ?? void 0,
      baseUrl: (s == null ? void 0 : s.base) ?? "",
      credentials: (s == null ? void 0 : s.credentials) ?? "same-origin"
    });
  }), t.registerMany(ht);
};
export {
  Et as onInit
};
//# sourceMappingURL=element-finder.js.map
