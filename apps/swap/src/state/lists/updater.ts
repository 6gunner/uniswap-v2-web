import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useActiveWeb3React } from "../../hooks";
import { useFetchListCallback } from "../../hooks/useFetchListCallback";
import useInterval from "../../hooks/useInterval";
import useIsWindowVisible from "../../hooks/useIsWindowVisible";
import { AppDispatch, AppState } from "../index";
import { getVersionUpgrade, VersionUpgrade } from "@repo/token-lists";
import { addPopup } from "../application/actions";
import { acceptListUpdate } from "./actions";

export default function Updater(): null {
  const { library } = useActiveWeb3React();
  const dispatch = useDispatch<AppDispatch>();
  const lists = useSelector<AppState, AppState["lists"]["byUrl"]>((state) => state.lists.byUrl);

  const isWindowVisible = useIsWindowVisible();

  const fetchList = useFetchListCallback();

  const fetchAllListsCallback = useCallback(() => {
    if (!isWindowVisible) return;
    Object.keys(lists).forEach((url) =>
      fetchList(url).catch((error) => console.debug("interval list fetching error", error))
    );
  }, [fetchList, isWindowVisible]);

  // fetch all lists every 10 minutes, but only after we initialize library
  useInterval(fetchAllListsCallback, library ? 1000 * 60 * 10 : null);

  useEffect(() => {
    Object.keys(lists).forEach((listUrl) => {
      const list = lists[listUrl];

      if (!list.current && !list.loadingRequestId && !list.error) {
        fetchList(listUrl).catch((error) => console.debug("list added fetching error", error));
      }
    });
  }, [dispatch, fetchList, library, lists]);

  // automatically update lists if versions are minor/patch
  useEffect(() => {
    Object.keys(lists).forEach((listUrl) => {
      const list = lists[listUrl];
      if (list.current && list.pendingUpdate) {
        const bump = getVersionUpgrade(list.current.version, list.pendingUpdate.version);
        // const min = minVersionBump(list.current.tokens, list.pendingUpdate.tokens);
        switch (bump) {
          case VersionUpgrade.NONE:
            throw new Error("unexpected no version bump");
          case VersionUpgrade.PATCH:
          case VersionUpgrade.MINOR:
          case VersionUpgrade.MAJOR:
            // automatically update minor/patch as long as bump matches the min update
            dispatch(acceptListUpdate(listUrl));
            dispatch(
              addPopup({
                key: listUrl,
                content: {
                  listUpdate: {
                    listUrl,
                    oldList: list.current,
                    newList: list.pendingUpdate,
                    auto: true,
                  },
                },
              })
            );
            break;
        }
      }
    });
  }, [dispatch, lists]);

  return null;
}
