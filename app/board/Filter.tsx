import { Chip, List, ListItem, Stack, Typography } from '@mui/material'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FilterCollectionType } from '@/types/board-type'
import { FilterChip } from '@/app/components/ui/FilterChip'
import {RealtimePaginationQuery } from "@/gql/graphql";
interface props {
    filteredData: FilterCollectionType | undefined // 처음 List를 받아왔을 때 생성되는 FilterCollection 수정하면 안됨
    postData: RealtimePaginationQuery['realtimePagination']| undefined
    setFilteredPostData: Dispatch<SetStateAction<(RealtimePaginationQuery['realtimePagination'] | undefined)>>
}

export const Filter = ({filteredData, setFilteredPostData, postData}: props) => {
    const [filterItems, setFilterItems] = useState<string[]>([]) // Chip과 연동되어 있어서 여기에 존재하는 것만 List에 띄어야함
    const handleFilter = (item: string) => {
        if (filterItems.includes(item)) {
            setFilterItems(prevFilterItems => prevFilterItems.filter(filterItem => filterItem !== item));
        } else {
            setFilterItems(prevFilterItems => [...prevFilterItems, item]);
        }
      };
    useEffect(() => { filteredData?.site && setFilterItems(filteredData?.site) }, [filteredData]);
    useEffect(() => {
        const filteredPosts = postData && postData.filter(post => post?.site && filterItems.includes(post.site));

        setFilteredPostData(filteredPosts);
     }, [filterItems, postData, setFilteredPostData]);

    return (
        <>
        <List>
            <ListItem>
                <Typography variant="body1" color={"gray"} component="div">
                    필터
                </Typography>
            </ListItem>
            <Stack direction="row" spacing={1} useFlexGap paddingX="8px">
                {filteredData && filteredData.site.map((site, index) => (
                    <FilterChip filterItems={filterItems}
                                onClick={(label) => {handleFilter(label)}}
                                key={index} label={site}/>
                ))}
            </Stack>
        </List>
        </>
    )
}
