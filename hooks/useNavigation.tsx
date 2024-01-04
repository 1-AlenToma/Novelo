import { useState, useRef } from "react";

class Navigator {
  nav: any;
  path: string;
  params: any = {};
  constructor(nav: any, path: string) {
    this.nav = nav;
    this.path = path;
  }

  add(param: any) {
    this.params = { ...this.params, ...param };
    return this;
  }

  navigate() {
    this.nav.navigate(this.path, this.params);
    return this;
  }

  push() {
    this.nav.push(this.path, this.params);
    return this;
  }
}
export default ({ route, navigation }) => {
  let back = () => navigation.goBack();

  let nav = (path: string) =>
    new Navigator(navigation, path);

  let set = (params: any) =>
    navigation.setParams(params);
    
  let canGoBack= ()=> navigation.canGoBack()

  return [
    route?.params,
    {
      nav,
      back,
      set,
      canGoBack
    },
    {navigation, route}
  ] as const;
};
