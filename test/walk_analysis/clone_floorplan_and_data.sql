insert into kalman_estimates
    select
      '5C13DBE7239D26204EBB8CE294DD8CC1',
      ap_id,
      x,
      y,
      kalman
    from kalman_estimates
    where fp_id = 'ee2a3068a005ad41b7439991ac00ad8e';

insert into scan_results
    select
      null,
      '5C13DBE7239D26204EBB8CE294DD8CC1',
      ap_id,
      x,
      y,
      value,
      orig_values,
      created
    from scan_results
    where fp_id = 'ee2a3068a005ad41b7439991ac00ad8e';


0 0 0 average error: 4.786525372213072 std: 2.415585051214682
1 0 0 average error: 5.000128511763433 std: 2.3091156850677894
2 0 0 average error: 4.185929854719193 std: 2.2194920304431314